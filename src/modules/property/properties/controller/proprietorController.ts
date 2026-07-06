import type { NextFunction, Request, Response } from "express";
import * as propertyService from "../service/proprietorService.js";
import { ApiError } from "../../../shared/utils/ApiError.js";

export const getMyListingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user!.userId;

    const listings = await propertyService.getMyListingsService(ownerId);

    res.status(200).json({
      success: true,
      message: "Your listings retrieved successfully.",
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

export const createPropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user!.userId;

    const {
      name,
      property_type,
      location,
      city,
      country,
      description,
      imageUrl,
    } = req.body;

    if (!name || name.trim().length < 3) {
      throw new ApiError(400, "Property title must be at least 3 characters.");
    }
    if (!property_type) {
      throw new ApiError(400, "Property type is required.");
    }
    if (!location || !city || !country) {
      throw new ApiError(400, "Address fields are required.");
    }

    const newProperty = await propertyService.createPropertyService(ownerId, {
      name,
      property_type,
      location,
      city,
      country,
      description,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully and is pending admin approval.",
      data: newProperty,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user!.userId;
    const propertyId = req.params.id as string;
    if (!propertyId) throw new ApiError(400, "Missing property id");

    const updated = await propertyService.updatePropertyService(
      propertyId,
      ownerId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Property updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user!.userId;
    const propertyId = req.params.id as string;
    if (!propertyId) throw new ApiError(400, "Missing property id");

    const deleted = await propertyService.deletePropertyService(
      propertyId,
      ownerId,
    );

    res.status(200).json({
      success: true,
      message: "Property deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};
