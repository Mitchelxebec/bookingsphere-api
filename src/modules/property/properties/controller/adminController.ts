import type { NextFunction, Request, Response } from "express";
import * as propertyService from "../service/adminService.js";
import { ApiError } from "../../../shared/utils/ApiError.js";

export const getPendingPropertiesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pending = await propertyService.getPendingPropertiesService();

    res.status(200).json({
      success: true,
      message: "Pending properties retrieved successfully.",
      data: pending,
    });
  } catch (error) {
    next(error);
  }
};

export const approvePropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.params.id as string;
    if (!propertyId) throw new ApiError(400, "Missing property id");

    const approved = await propertyService.approvePropertyService(propertyId);

    res.status(200).json({
      success: true,
      message: "Property approved successfully.",
      data: approved,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectPropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.params.id as string;
    if (!propertyId) throw new ApiError(400, "Missing property id");

    const { reason } = req.body;

    const rejected = await propertyService.rejectPropertyService(
      propertyId,
      reason,
    );

    res.status(200).json({
      success: true,
      message: "Property rejected.",
      data: rejected,
    });
  } catch (error) {
    next(error);
  }
};

export const forceDeletePropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.params.id as string;
    if (!propertyId) throw new ApiError(400, "Missing property id");

    const deleted =
      await propertyService.forceDeletePropertyService(propertyId);

    res.status(200).json({
      success: true,
      message: "Property forcefully deleted by admin.",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};
