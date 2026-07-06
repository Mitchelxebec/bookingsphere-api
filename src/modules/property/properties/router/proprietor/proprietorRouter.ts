import { Router } from "express";
import { userToken } from "../../../../shared/middleware/tokenMiddleware.js";
import { requireRoles } from "../../../../shared/middleware/roleGuard.js";
import { verifyActiveProprietor } from "../../../../shared/middleware/proprietorGuard.js";
import * as controller from "../../controller/proprietorController.js";

const router = Router();

router.get(
  "/my-listings",
  userToken,
  requireRoles(["PROPRIETOR"]),
  controller.getMyListingsController,
);
router.post(
  "/",
  userToken,
  requireRoles(["PROPRIETOR"]),
  verifyActiveProprietor,
  controller.createPropertyController,
);
router.patch(
  "/:id",
  userToken,
  requireRoles(["PROPRIETOR"]),
  verifyActiveProprietor,
  controller.updatePropertyController,
);
router.delete(
  "/:id",
  userToken,
  requireRoles(["PROPRIETOR"]),
  verifyActiveProprietor,
  controller.deletePropertyController,
);

export default router;
