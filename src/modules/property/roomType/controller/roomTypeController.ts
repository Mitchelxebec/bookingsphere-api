import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../shared/utils/ApiError.js";
import * as roomTypeService from "../service/roomTypeService.js";

export const getRoomTypesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.params.propertyId as string;
    if (!propertyId) throw new ApiError(400, "Missing property id.");

    const roomTypesList = await roomTypeService.getRoomTypesService(propertyId);

    res.status(200).json({
      success: true,
      message: "Room types retrieved successfully.",
      data: roomTypesList,
    });
  } catch (error) {
    next(error);
  }
};

export const createRoomTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const propertyId = req.params.propertyId as string;
    if (!propertyId) throw new ApiError(400, "Missing property id.");

    const ownerId = req.user!.userId;

    const { name, basePrice, capacity, description } = req.body;

    if (!name || name.trim().length < 2) {
      throw new ApiError(400, "Room type name must be at least 2 characters.");
    }
    if (!basePrice) {
      throw new ApiError(400, "Base price is required.");
    }
    if (capacity === undefined || capacity === null) {
      throw new ApiError(400, "Capacity is required.");
    }

    const newRoomType = await roomTypeService.createRoomTypeService(
      propertyId,
      ownerId,
      {
        name,
        basePrice: String(basePrice),
        capacity: Number(capacity),
        ...(description && { description }),
      },
    );

    res.status(201).json({
      success: true,
      message: "Room type created successfully.",
      data: newRoomType,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoomTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId, id } = req.params as { propertyId: string; id: string };
    if (!propertyId) throw new ApiError(400, "Missing property id.");
    if (!id) throw new ApiError(400, "Missing room type id.");

    const ownerId = req.user!.userId;

    const { name, basePrice, capacity, description } = req.body;

    const updated = await roomTypeService.updateRoomTypeService(id, ownerId, {
      ...(name && { name }),
      ...(basePrice && { basePrice: String(basePrice) }),
      ...(capacity !== undefined && { capacity: Number(capacity) }),
      ...(description && { description }),
    });

    res.status(200).json({
      success: true,
      message: "Room type updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoomTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { propertyId, id } = req.params as { propertyId: string; id: string };
    if (!propertyId) throw new ApiError(400, "Missing property id.");
    if (!id) throw new ApiError(400, "Missing room type id.");

    const ownerId = req.user!.userId;

    const deleted = await roomTypeService.deleteRoomTypeService(id, ownerId);

    res.status(200).json({
      success: true,
      message: "Room type deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};
