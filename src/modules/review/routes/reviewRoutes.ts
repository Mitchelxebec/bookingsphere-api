import { Router } from "express";
import { userToken } from "../../shared/middleware/tokenMiddleware.js";
import { validateBody } from "../../shared/middleware/validateBody.js";
import {
  createReviewSchema,
  proprietorResponseSchema,
} from "../validator/reviewValidator.js";
import {
  createResponseController,
  createReviewController,
  flagReviewController,
  getFlaggedReviewsController,
  getReviewsByPropertyController,
  softDeleteReviewController,
} from "../controller/reviewController.js";
import { requireRoles } from "../../shared/middleware/roleGuard.js";
import { verifyActiveProprietor } from "../../shared/middleware/proprietorGuard.js";

const router = Router();

router.post(
  "/",
  userToken,
  requireRoles(["GUEST", "PROPRIETOR"]),
  validateBody(createReviewSchema),
  createReviewController,
);
router.get("/property/:propertyId", getReviewsByPropertyController);

// PROPRIETORS
router.patch(
  "/:propertyId/:id/response",
  userToken,
  requireRoles(["PROPRIETOR"]),
  verifyActiveProprietor,
  validateBody(proprietorResponseSchema),
  createResponseController,
);
router.patch(
  "/:id/report",
  userToken,
  requireRoles(["PROPRIETOR"]),
  verifyActiveProprietor,
  flagReviewController,
);

// ADMIN
router.get(
  "/flagged",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  getFlaggedReviewsController,
);
router.delete(
  "/admin/:id",
  userToken,
  requireRoles(["ADMIN", "SUPERADMIN"]),
  softDeleteReviewController,
);

export default router;
