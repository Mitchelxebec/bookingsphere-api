import type { NextFunction, Request, Response } from "express";
import * as propertyService from "../service/publicService.js";
import { ApiError } from "../../../shared/utils/ApiError.js";

// ── PUBLIC ────────────────────────────────────────────────

export const searchPropertiesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      city,
      country,
      check_in,
      check_out,
      min_price,
      max_price,
      guests_count,
      property_type,
      amenities,
      page,
      limit,
    } = req.query;

    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 20;

    const filters = {
      ...(city && { city: city as string }),
      ...(country && { country: country as string }),
      ...(check_in && { checkIn: check_in as string }),
      ...(check_out && { checkOut: check_out as string }),
      ...(min_price && { minPrice: Number(min_price) }),
      ...(max_price && { maxPrice: Number(max_price) }),
      ...(guests_count && { guestsCount: Number(guests_count) }),
      ...(property_type && {
        propertyType: property_type as
          | "HOTEL"
          | "APARTMENT"
          | "VILLA"
          | "GUESTHOUSE",
      }),
      ...(amenities && { amenities: (amenities as string).split(",") }),
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    };
    
    const results = await propertyService.searchPropertiesService(filters);

    res.status(200).json({
      success: true,
      message: "Properties retrieved successfully.",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.params.id as string;
    if (!propertyId) throw new ApiError(400, "Missing property id");

    const property = await propertyService.getPropertyByIdService(propertyId);

    res.status(200).json({
      success: true,
      message: "Property retrieved successfully.",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};
