import { Router } from "express";
import { userToken } from "../../../shared/middleware/tokenMiddleware.js";
import { requireRoles } from "../../../shared/middleware/roleGuard.js";
import { viewPendingController } from "../../controller/admin/adminViewPendingController.js";
import { kycApproveController } from "../../controller/admin/adminApprove.js";
import { kycRejectController } from "../../controller/admin/adminReject.js";


const router = Router();

router.get(
  "/pending",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  viewPendingController,
);

router.patch(
  "/:id/approve",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  kycApproveController,
);

router.patch(
  "/:id/reject",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  kycRejectController,
);

export default router;
