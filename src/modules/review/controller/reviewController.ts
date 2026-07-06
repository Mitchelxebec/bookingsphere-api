import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  createResponseService,
  createReviewService,
  flagReviewService,
  getFlaggedReviewsService,
  getReviewByPropertyIdService,
  softDeleteReviewService,
} from "../service/reviewService.js";

export const createReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(404, "Missing authentication information");

    if (
      !req.body ||
      !req.body.propertyId ||
      !req.body.reservationId ||
      !req.body.rating ||
      !req.body.comment
    ) {
      throw new ApiError(
        400,
        "Missing required fields: propertyId or reservationId or rating or comment",
      );
    }

    const { propertyId, reservationId, rating, comment } = req.body;

    const newReview = await createReviewService({
      propertyId,
      userId,
      reservationId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review successfully written",
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByPropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId } = req.params as { propertyId: string };
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const offset = (page - 1) * limit;

    if (!propertyId) throw new ApiError(400, "Missing property id");

    const reviews = await getReviewByPropertyIdService(
      propertyId,
      limit,
      offset,
    );

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully.",
      data: reviews,
      pagination: {
        page,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PROPRIETOR
export const createResponseController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) throw new ApiError(401, "Missing authentication information");

    const { id, propertyId } = req.params as {
      id: string;
      propertyId: string;
    };
    if (!id || !propertyId)
      throw new ApiError(400, "Missing reviewId or propertyId");

    const response = req.body.response;
    if (!response) throw new ApiError(400, "Mising response");

    const result = await createResponseService(
      propertyId,
      ownerId,
      id,
      response,
    );

    res.status(200).json({
      success: true,
      message: "Response submitted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const flagReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?.userId;
    if (!ownerId) throw new ApiError(401, "Missing authentication information");

    const { id } = req.params as { id: string };
    if (!id) throw new ApiError(400, "Missing review id");

    const reason = req.body.reason;
    if (!reason) throw new ApiError(400, "Mising reason");

    const result = await flagReviewService(id, ownerId, reason);
    res.status(200).json({
      success: true,
      message:
        "Review flagged successfully. Our moderation team will review it shortly.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN
export const getFlaggedReviewsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getFlaggedReviewsService();
    res.status(200).json({
      success: true,
      message: "Flagged reviews retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const softDeleteReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) throw new ApiError(400, "Missing review id");

    const result = await softDeleteReviewService(id);
    res.status(200).json({
      success: true,
      message: "Review removed successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
