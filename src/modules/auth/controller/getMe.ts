import type { NextFunction, Request, Response } from "express";

export const getMeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      userInfo: user,
    });
  } catch (error) {
    next(error);
  }
};
