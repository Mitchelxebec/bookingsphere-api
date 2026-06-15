import { Router } from "express";
import { userToken } from "../../../shared/middleware/tokenMiddleware.js";
import { requireRoles } from "../../../shared/middleware/roleGuard.js";
import { allUserController } from "../../controller/admin/allUsers.js";
import { changeUserRoleController } from "../../controller/admin/changeUserController.js";
import { banUserController } from "../../controller/admin/banUserAccount.js";
import { unBanUserController } from "../../controller/admin/unBanUserAccount.js";

const router = Router();

router.get(
  "/all",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  allUserController,
);
router.patch(
  "/:id/role",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  changeUserRoleController,
);
router.patch(
  "/:id/ban",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  banUserController,
);
router.patch(
  "/:id/unban",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  unBanUserController,
);

export default router;
