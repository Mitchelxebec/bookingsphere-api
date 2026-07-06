import { Router } from "express";
import { userToken } from "../../../shared/middleware/tokenMiddleware.js";
import { requireRoles } from "../../../shared/middleware/roleGuard.js";
import { verifyActiveProprietor } from "../../../shared/middleware/proprietorGuard.js";
import * as controller from "../controller/roomTypeController.js";

const router = Router({ mergeParams: true });

// ── PUBLIC ────────────────────────────────────────────────
// GET /properties/:propertyId/room-types
router.get("/", controller.getRoomTypesController);

// ── PROPRIETOR ────────────────────────────────────────────
// POST /properties/:propertyId/room-types
router.post(
  "/",
  userToken,
  requireRoles(["PROPRIETOR"]),
  verifyActiveProprietor,
  controller.createRoomTypeController,
);

// PATCH /properties/:propertyId/room-types/:id
router.patch(
  "/:id",
  userToken,
  requireRoles(["PROPRIETOR"]),
  verifyActiveProprietor,
  controller.updateRoomTypeController,
);

// DELETE /properties/:propertyId/room-types/:id/remove
router.delete(
  "/:id",
  userToken,
  requireRoles(["PROPRIETOR"]),
  verifyActiveProprietor,
  controller.deleteRoomTypeController,
);

export default router;
