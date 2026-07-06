import { Router } from "express";
import { userToken } from "../../shared/middleware/tokenMiddleware.js";
import { requireRoles } from "../../shared/middleware/roleGuard.js";
import * as controller from "../controller/wishlistController.js";

const router = Router();

// All wishlist routes require authentication
router.get(
  "/",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  controller.getMyWishlistController,
);

router.post(
  "/:propertyId",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  controller.addToWishlistController,
);

router.delete(
  "/:propertyId",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  controller.removeFromWishlistController,
);

export default router;