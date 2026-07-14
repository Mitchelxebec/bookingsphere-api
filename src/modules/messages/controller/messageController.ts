import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { fetchChatHistoryService } from "../service/messageService.js";

export const messageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reservationId = req.params.reservationId as string;
    const currentUserId = req.user?.userId;
    if (!currentUserId)
      throw new ApiError(403, "Missing Authentication Information.");

    const message = await fetchChatHistoryService(reservationId, currentUserId);

    res.status(200).json({
      success: true,
      message: "Message successfully retrieved",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
