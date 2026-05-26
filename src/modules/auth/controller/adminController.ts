import type { NextFunction, Request, Response } from "express";

export const getAdminDashboard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).json({
      success: true,
      message: "Welcome Admin",
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};
