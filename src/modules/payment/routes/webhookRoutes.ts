import { Router } from "express";
import express from "express";
import { processWebhookController } from "../controller/paymentController.js";

const router = Router();

router.post(
  "/paystack",
  express.raw({ type: "application/json" }),
  processWebhookController,
);

export default router;
