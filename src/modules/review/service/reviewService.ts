import { findPropertyByIdAndOwner } from "../../property/properties/repository/proprietorRepository.js";
import { findMyReservationById } from "../../reservation/repository/reservationRepository.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  createResponse,
  createReview,
  findFlaggedReviews,
  findPropertyIdByReservationId,
  findReviewById,
  findReviewByReservationId,
  findReviewsByPropertyId,
  flagReview,
  softDeleteReview,
} from "../repository/reviewRepository.js";

interface CreateReviewDTO {
  propertyId: string;
  userId: string;
  reservationId: string;
  rating: number;
  comment: string;
}
export const createReviewService = async (data: CreateReviewDTO) => {
  const reservationExist = await findMyReservationById(
    data.reservationId,
    data.userId,
  );
  if (!reservationExist) throw new ApiError(404, "No reservation made");
  if (reservationExist.status !== "CHECKED_OUT")
    throw new ApiError(403, "You can only review a property after checkout.");

  // If this returns something, the guest IS the owner → block them
  const isOwnProperty = await findPropertyByIdAndOwner(
    data.propertyId,
    data.userId,
  );

  if (isOwnProperty) {
    throw new ApiError(
      403,
      "Proprietors cannot write reviews for their own properties.",
    );
  }

  const checkoutDate = new Date(reservationExist.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0); //set to midnight

  if (today <= checkoutDate)
    throw new ApiError(403, "You can only review after your checkout date");

  const existingReview = await findReviewByReservationId(data.reservationId);
  if (existingReview)
    throw new ApiError(409, "You have already reviewed this stay.");

  const actual = await findPropertyIdByReservationId(data.reservationId);
  if (!actual) throw new ApiError(404, "Reservation not found.");
  if (actual.propertyId !== data.propertyId)
    throw new ApiError(403, "Property ID does not match this reservation.");

  const newReview = await createReview({
    propertyId: data.propertyId,
    userId: data.userId,
    reservationId: data.reservationId,
    rating: data.rating,
    comment: data.comment,
  });

  if (!newReview) throw new ApiError(500, "Failed to create review.");

  return newReview;
};

export const getReviewByPropertyIdService = async (
  propertyId: string,
  limit: number,
  offset: number,
) => {
  return await findReviewsByPropertyId(propertyId, limit, offset);
};

// PROPRIETOR
export const createResponseService = async (
  propertyId: string,
  ownerId: string,
  reviewId: string,
  response: string,
) => {
  const isOwner = await findPropertyByIdAndOwner(propertyId, ownerId);
  if (!isOwner)
    throw new ApiError(403, "Proprietor is not the owner of this property");

  const review = await findReviewById(reviewId);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.response !== null)
    throw new ApiError(409, "You have already responded to this review.");

  const responded = await createResponse(response, reviewId);
  return responded;
};

export const flagReviewService = async (
  reviewId: string,
  ownerId: string,
  reason: string,
) => {
  if (!reason || reason.trim().length === 0)
    throw new ApiError(400, "A reason is required to flag a review.");

  const review = await findReviewById(reviewId);
  if (!review) throw new ApiError(404, "Review not found.");

  // Already flagged by someone
  if (review.reviewStatus === "FLAGGED")
    throw new ApiError(409, "This review has already been flagged.");

  // Confirm proprietor owns the property this review belongs to
  const isOwner = await findPropertyByIdAndOwner(review.propertyId, ownerId);
  if (!isOwner)
    throw new ApiError(
      403,
      "You can only flag reviews on your own properties.",
    );

  return await flagReview(reviewId, ownerId, reason);
};

// ADMIN
export const getFlaggedReviewsService = async () => {
  const result = await findFlaggedReviews();
  return result
};

export const softDeleteReviewService = async (reviewId: string) => {
  const review = await findReviewById(reviewId);
  if (!review) throw new ApiError(404, "No review found");

  const result = await softDeleteReview(reviewId)
  return result
};
