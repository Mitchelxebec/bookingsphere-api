import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  cancelAndRefund,
  initializeCheckoutService,
  processWebhookService,
} from "../service/paymentService.js";

export const initializeCheckoutController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      throw new ApiError(401, "Authentication required. Please log in.");

    const { reservationId } = req.params as { reservationId: string };
    if (!reservationId)
      throw new ApiError(
        400,
        "Reservation ID is required to initialize payment.",
      );

    const { accessCode, reference, authorizationUrl } =
      await initializeCheckoutService(reservationId, userId);

    res.status(200).json({
      success: true,
      message:
        "Payment session created successfully. Redirect the guest to the authorization URL to complete payment.",
      data: {
        accessCode,
        reference,
        authorizationUrl,
        instructions:
          "Redirect the user to authorizationUrl to complete payment. You have 15 minutes before the reservation expires.",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const processWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let rawBody: string;

    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString("utf-8");
    } else if (typeof req.body === "object") {
      console.warn(
        "⚠️ Webhook received pre-parsed body — signature verification may fail.",
      );
      rawBody = JSON.stringify(req.body);
    } else {
      rawBody = req.body;
    }

    if (!rawBody) throw new ApiError(400, "Missing request body");

    const signature = req.headers["x-paystack-signature"] as string;
    if (!signature)
      throw new ApiError(
        401,
        "Webhook signature header is missing. Request rejected.",
      );

    // Respond immediately — Paystack requires a response within 8 seconds
    res.status(200).json({ received: true });

    // Process asynchronously after response is sent
    processWebhookService(rawBody, signature).catch((error) => {
      console.error("💥 Webhook processing failed silently:", error);
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAndRefundController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      throw new ApiError(401, "Authentication required. Please log in.");

    const { reservationId } = req.params as { reservationId: string };
    if (!reservationId)
      throw new ApiError(
        400,
        "Reservation ID is required to process a refund.",
      );

    const result = await cancelAndRefund(reservationId, userId);

    res.status(200).json({
      success: true,
      message:
        "Refund successfully initiated. The amount will be returned to your original payment method within 3-5 business days depending on your bank.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
