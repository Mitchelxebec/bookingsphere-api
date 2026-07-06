import type { NextFunction, Request, Response } from "express";
import { viewPendingService } from "../../service/admin/adminViewPending.js";

export const viewPendingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationQueue = await viewPendingService();

    res.status(200).json({
      success: true,
      message: "Pending KYC applications queue fetched successfully.",
      count: applicationQueue.length,
      data: applicationQueue,
    });
  } catch (error) {
    next(error);
  }
};
