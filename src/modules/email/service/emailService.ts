import { Resend } from "resend";
import { ApiError } from "../../shared/utils/ApiError.js";
import { findBookingEmailData } from "../repository/emailRepository.js";
import { findPaymentByReservationId } from "../../payment/repository/paymentRepository.js";
import { paymentConfirmedTemplate } from "../templates/paymentConfirmed.js";
import { reservationCancelledTemplate } from "../templates/reservationCancelled.js";
import { refundInitiatedTemplate } from "../templates/refundInitiated.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── HELPERS ───────────────────────────────────────────────

const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return nights;
};

export const sendPaymentConfirmedEmail = async (reservationId: string) => {
  const info = await findBookingEmailData(reservationId);
  if (!info) throw new ApiError(404, "No data found");

  const payment = await findPaymentByReservationId(reservationId);
  if (!payment) throw new ApiError(404, "payment not found");

  const paymentMethods = payment.paymentMethod;
  if (!paymentMethods) throw new ApiError(500, "payment method missing");

  // . Calculate total price
  const nights = calculateNights(info.checkIn, info.checkOut);

  const data = {
    ...info,
    nights,
    paymentMethod: paymentMethods,
  };

  await resend.emails.send({
    from: "BookingSphere <onboarding@resend.dev>",
    to: info.guestEmail,
    subject: "Your booking is confirmed!",
    html: paymentConfirmedTemplate(data),
  });

  return data;
};

interface reservationCancelledDTO {
  reservationId: string;
  cancelledBy: "GUEST" | "PROPRIETOR" | "ADMIN" | "NON_PAYMENT";
  refundAmount: string | null;
  refundEligible: boolean;
}
export const sendReservationCancelledEmail = async (
  data: reservationCancelledDTO,
) => {
  const info = await findBookingEmailData(data.reservationId);
  if (!info) throw new ApiError(404, "No data found");

  const emailData = {
    guestName: info.guestName,
    reservationId: data.reservationId,
    propertyName: info.propertyName,
    checkIn: info.checkIn,
    checkOut: info.checkOut,
    cancellationDate: new Date().toLocaleDateString(),
    cancelledBy: data.cancelledBy,
    refundAmount: data.refundAmount,
    refundEligible: data.refundEligible,
  };

  await resend.emails.send({
    from: "BookingSphere <onboarding@resend.dev>",
    to: info.guestEmail,
    subject: `Your reservation at ${info.propertyName} has been cancelled.`,
    html: reservationCancelledTemplate(emailData),
  });

  return emailData;
};

export const sendRefundInitiatedEmail = async (reservationId: string) => {
  const info = await findBookingEmailData(reservationId);
  if (!info) throw new ApiError(404, "No data found");

  const payment = await findPaymentByReservationId(reservationId);
  if (!payment || !payment.paymentMethod || !payment.paystackReference)
    throw new ApiError(
      500,
      "payment or payment method or payment reference not found",
    );

  const emailData = {
    guestName: info.guestName,
    reservationId: reservationId,
    propertyName: info.propertyName,
    refundAmount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paystackReference: payment.paystackReference,
    refundInitiatedAt: new Date().toLocaleDateString(),
  };

  await resend.emails.send({
    from: "BookingSphere <onboarding@resend.dev>",
    to: info.guestEmail,
    subject: `Your reservation at ${info.propertyName} has been cancelled.`,
    html: refundInitiatedTemplate(emailData),
  });

  return emailData;
};
