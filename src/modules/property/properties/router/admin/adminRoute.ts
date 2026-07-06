import { Router } from "express";
import { userToken } from "../../../../shared/middleware/tokenMiddleware.js";
import { requireRoles } from "../../../../shared/middleware/roleGuard.js";
import * as controller from "../../controller/adminController.js";

const router = Router();

// ── ADMIN (registered before /:id to avoid route collision) ──
router.get(
  "/pending",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  controller.getPendingPropertiesController,
);
router.patch(
  "/:id/approve",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  controller.approvePropertyController,
);
router.patch(
  "/:id/reject",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  controller.rejectPropertyController,
);
router.delete(
  "/:id/",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  controller.forceDeletePropertyController,
);

export default router