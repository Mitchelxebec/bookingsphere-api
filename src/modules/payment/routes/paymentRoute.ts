import { Router } from "express";
import {
  cancelAndRefundController,
  initializeCheckoutController,
} from "../controller/paymentController.js";
import { userToken } from "../../shared/middleware/tokenMiddleware.js";
import { requireRoles } from "../../shared/middleware/roleGuard.js";

const router = Router();

router.post(
  "/:reservationId/initialize",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  initializeCheckoutController,
);

router.post(
  "/:reservationId/refund",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  cancelAndRefundController,
);

export default router;
