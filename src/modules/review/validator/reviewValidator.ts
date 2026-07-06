import { z } from "zod";

export const createReviewSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID."),
  reservationId: z.string().uuid("Invalid reservation ID."),
  rating: z.number().int().min(1).max(10),
  comment: z
    .string()
    .min(10, "comment must be at least 10 characters long")
    .max(1000, "Response must be at most 1000 characters long"),
});

export const proprietorResponseSchema = z.object({
  response: z
    .string()
    .min(5, "Response must be atleast 5 characters long")
    .max(1000, "Response must be at most 1000 characters long"),
});
