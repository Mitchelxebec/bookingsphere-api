import type { NextFunction, Request, Response } from "express";
import { getAllUserService } from "../../service/admin/getUserList.js";

export const allUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, search } = req.query;

    const data = await getAllUserService(
      page as string,
      limit as string,
      search as string,
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
