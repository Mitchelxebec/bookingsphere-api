import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { getProperietorProps } from "../../property/properties/repository/properties.js";

export const isPropertyOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user || !user.userId)
      return next(new ApiError(401, "Authentication required"));

    if (
      !user.roles.includes("PROPRIETOR") ||
      user.proprietorStatus !== "APPROVED"
    )
      return next(
        new ApiError(
          403,
          "Access Denied. Your account must be KYC-approved to access this area.",
        ),
      );

    const propertyId = req.params.id as string;
    if (!propertyId)
      return next(new ApiError(401, "Missing property information"));

    const property = await getProperietorProps(propertyId, user.userId);
    if (!property)
      return next(new ApiError(404, "User does not own a property"));

    req.property = property;
    next();
  } catch (error) {
    next(error);
  }
};
