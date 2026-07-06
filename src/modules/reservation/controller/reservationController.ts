import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import * as reservationService from "../service/reservationService.js";

// ── GUEST ─────────────────────────────────────────────────

export const createReservationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { roomTypeId, checkIn, checkOut } = req.body;

    if (!roomTypeId) throw new ApiError(400, "Room type id is required.");
    if (!checkIn) throw new ApiError(400, "Check-in date is required.");
    if (!checkOut) throw new ApiError(400, "Check-out date is required.");

    const reservation = await reservationService.createReservationService(
      userId,
      { roomTypeId, checkIn, checkOut },
    );

    res.status(201).json({
      success: true,
      message: "Reservation created. You have 15 minutes to complete payment.",
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReservationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;

    const reservationsList =
      await reservationService.getMyReservationsService(userId);

    res.status(200).json({
      success: true,
      message: "Reservations retrieved successfully.",
      data: reservationsList,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReservationByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const reservation = await reservationService.getMyReservationByIdService(
      id,
      userId,
    );

    res.status(200).json({
      success: true,
      message: "Reservation retrieved successfully.",
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyReservationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const cancelled = await reservationService.cancelMyReservationService(
      id,
      userId,
    );

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully.",
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
};

// ── PROPRIETOR ────────────────────────────────────────────

export const getPropertyReservationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user!.userId;
    const { propertyId } = req.params as { propertyId: string };

    const reservationsList =
      await reservationService.getPropertyReservationsService(
        propertyId,
        ownerId,
      );

    res.status(200).json({
      success: true,
      message: "Property reservations retrieved successfully.",
      data: reservationsList,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelReservationOverrideController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };

    const userRoles = req.user?.roles;
    if (!userRoles) throw new ApiError(403, "Missing authentication info");

    const cancelledBy =
      userRoles.includes("ADMIN") || userRoles.includes("SUPERADMIN")
        ? "ADMIN"
        : "PROPRIETOR";

    const cancelled = await reservationService.cancelReservationOverrideService(
      id,
      cancelledBy,
    );
    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully.",
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
};

// ── ADMIN ─────────────────────────────────────────────────

export const getAllReservationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reservationsList =
      await reservationService.getAllReservationsService();

    res.status(200).json({
      success: true,
      message: "All reservations retrieved successfully.",
      data: reservationsList,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (!status) throw new ApiError(400, "Status is required.");

    const validStatuses = [
      "PENDING",
      "PAID",
      "CHECKED_IN",
      "CHECKED_OUT",
      "CANCELLED",
      "EXPIRED",
    ];

    if (!validStatuses.includes(status)) {
      throw new ApiError(
        400,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    const updated = await reservationService.updateReservationStatusService(
      id,
      status,
    );

    res.status(200).json({
      success: true,
      message: "Reservation status updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
