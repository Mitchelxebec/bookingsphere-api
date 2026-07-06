import axios from "axios";
import crypto from "crypto";
import {
  findMyReservationById,
  updateReservationStatus,
} from "../../reservation/repository/reservationRepository.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  createPayment,
  findPaymentByReference,
  findPaymentByReservationId,
  updatePaymentStatus,
} from "../repository/paymentRepository.js";
import { findUserById } from "../../user/repository/userRepo.js";
import { sendPaymentConfirmedEmail, sendRefundInitiatedEmail } from "../../email/service/emailService.js";

export const initializeCheckoutService = async (
  reservationId: string,
  userId: string,
) => {
  // DOES THE RESERVATION EXIST AND WHO MADE THE RESERVATION
  const myReservation = await findMyReservationById(reservationId, userId);
  if (!myReservation) throw new ApiError(404, "Reservation not found");

  const reservationStatus = myReservation.status;
  if (reservationStatus === "EXPIRED")
    throw new ApiError(410, "Gone. Your hold has expired, please rebook");

  if (reservationStatus === "PAID")
    throw new ApiError(400, "This reservation is already paid");

  if (reservationStatus !== "PENDING")
    throw new ApiError(400, "Invalid reservation status");

  if (!myReservation.totalPrice) {
    throw new ApiError(
      500,
      "Reservation has no price. Please contact support.",
    );
  }

  // HAS THIS RESERVATION BEEN PAID FOR ALREADY
  const paymentExist = await findPaymentByReservationId(reservationId);
  if (paymentExist && paymentExist.status === "PENDING") {
    return {
      accessCode: paymentExist.paystackAccessCode,
      reference: paymentExist.paystackReference,
      authorizationUrl: `https://checkout.paystack.com/${paymentExist.paystackAccessCode}`,
    };
  }

  const userInfo = await findUserById(userId);

  const payload = {
    email: userInfo?.email,
    amount: Math.round(parseFloat(myReservation.totalPrice) * 100),
    reference: crypto.randomUUID(),
  };

  const config = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post(
      `https://api.paystack.co/transaction/initialize`,
      payload,
      config,
    );

    const accessCode = response.data.data.access_code;
    const reference = response.data.data.reference;
    const authorizationUrl = response.data.data.authorization_url;

    await createPayment(
      reservationId,
      userId,
      myReservation.totalPrice,
      reference,
      accessCode,
    );

    return { accessCode, reference, authorizationUrl };
  } catch (error) {
    throw new ApiError(502, "Payment gateway error. Please try again.");
  }
};

interface PaystackEvent {
  event: "charge.success" | "charge.failed" | "refund.processed";
  data: {
    reference: string;
    channel: string;
    gateway_response: string;
    status: string;
    amount: number;
  };
}

export const processWebhookService = async (
  rawBody: string, // Raw unparsed body text
  signature: string, // Value from req.headers["x-paystack-signature"]
) => {
  // 1. Calculate the local HMAC signature
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  // 2. CRITICAL SECURITY: Use timingSafeEqual to prevent timing side-channel attacks
  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(hash, "utf-8"),
    Buffer.from(signature, "utf-8"),
  );

  if (!isSignatureValid) {
    throw new ApiError(401, "Invalid webhook signature");
  }

  // 3. Parse the verified payload safely
  const event = JSON.parse(rawBody) as PaystackEvent;
  const { reference, amount, channel, gateway_response, status } = event.data;

  // 4. Look up the matching payment log in your database
  const payment = await findPaymentByReference(reference);
  if (!payment) return; // Exit if the reference doesn't belong to your system

  // HANDLE SUCCESSFUL PAYMENTS
  if (event.event === "charge.success") {
    // Prevent duplicate processing if a webhook retries
    if (payment.status === "COMPLETED") return;

    // Convert your database string/number to Kobo safely
    const expectedAmountInKobo = Math.round(parseFloat(payment.amount) * 100);

    // Guard against payment tampering / manual price manipulation
    if (amount !== expectedAmountInKobo) {
      await updatePaymentStatus(reference, {
        status: "FAILED",
        failureReason: "Amount mismatch detected. Possible payment tampering.",
      });
      return;
    }

    // Update your payment ledger to COMPLETED
    await updatePaymentStatus(reference, {
      status: "COMPLETED",
      paymentMethod: channel,
    });

    // Finalize the room booking status
    await updateReservationStatus(payment.reservationId, "PAID");

    // send confirmation mail
    await sendPaymentConfirmedEmail(payment.reservationId);
  }

  // HANDLE FAILED PAYMENTS
  if (event.event === "charge.failed") {
    if (payment.status === "FAILED") return;

    await updatePaymentStatus(reference, {
      status: "FAILED",
      failureReason: gateway_response,
    });

    // Pro-Tip: Call your room inventory service here to set the hold status to "EXPIRED"
    // or "CANCELLED" immediately so another customer can book it.
  }

  // HANDLE REFUND PROCESSING
  if (event.event === "refund.processed") {
    // Map Paystack's text status to your strict DB enum types
    let mappedRefundStatus: "SUCCESS" | "FAILED" | "PENDING" = "PENDING";
    if (status === "success") mappedRefundStatus = "SUCCESS";
    if (status === "failed") mappedRefundStatus = "FAILED";

    await updatePaymentStatus(reference, {
      status: "REFUNDED",
      refundedAt: new Date(),
      refundedStatus: mappedRefundStatus,
    });
  }
};

export const cancelAndRefund = async (
  reservationId: string,
  userId: string,
) => {
  const reservation = await findMyReservationById(reservationId, userId);

  if (!reservation) throw new ApiError(404, "No reservation found.");

  if (reservation.status !== "PAID")
    throw new ApiError(
      403,
      `Cannot refund a payment with status: ${reservation.status}`,
    );

  const payment = await findPaymentByReservationId(reservationId);
  if (!payment)
    throw new ApiError(404, "No payment record found for this reservation.");

  if (payment.status !== "COMPLETED")
    throw new ApiError(
      400,
      `Cannot refund a payment with status: ${payment.status}`,
    );

  const payload = {
    transaction: payment.paystackReference, // The reference string your repo found
    amount: Math.round(parseFloat(payment.amount) * 100),
    merchant_note: `Automated refund for cancelled reservation #${reservationId}`,
  };

  const config = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post(
      `https://api.paystack.co/refund`,
      payload,
      config,
    );

    await updatePaymentStatus(payment.paystackReference, {
      status: "REFUNDED",
      refundedAt: new Date(),
      refundedStatus: "PENDING",
    });

    await updateReservationStatus(reservationId, "CANCELLED");
    await sendRefundInitiatedEmail(reservationId);

    return {
      message: "Refund initiated successfully.",
      reference: payment.paystackReference,
      amount: payment.amount,
      refundedStatus: "PENDING",
    };
  } catch (error) {
    throw new ApiError(502, "Payment gateway error. Please try again.");
  }
};
