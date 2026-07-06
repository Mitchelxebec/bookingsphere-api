import { Router } from "express";
import { userToken } from "../../shared/middleware/tokenMiddleware.js";
import { requireRoles } from "../../shared/middleware/roleGuard.js";
import * as controller from "../controller/reservationController.js";

const router = Router();

// ── GUEST ─────────────────────────────────────────────────
router.post(
  "/",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  controller.createReservationController,
);
router.get(
  "/my",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  controller.getMyReservationsController,
);
router.get(
  "/my/:id",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  controller.getMyReservationByIdController,
);
router.delete(
  "/my/:id/cancel",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  controller.cancelMyReservationController,
);

// ── PROPRIETOR ────────────────────────────────────────────
router.get(
  "/property/:propertyId",
  userToken,
  requireRoles(["PROPRIETOR"]),
  controller.getPropertyReservationsController,
);
router.delete(
  "/:id/cancel",
  userToken,
  requireRoles(["PROPRIETOR", "ADMIN", "SUPERADMIN"]),
  controller.cancelReservationOverrideController,
);

// ── ADMIN ─────────────────────────────────────────────────
router.get(
  "/",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  controller.getAllReservationsController,
);
router.patch(
  "/:id/status",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  controller.updateReservationStatusController,
);

export default router;