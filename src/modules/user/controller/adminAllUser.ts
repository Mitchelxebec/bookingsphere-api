import type { NextFunction, Request, Response } from "express";
import { getUsersListService } from "../service/adminAllUsersInfo.js";

export const getAllUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, search } = req.query;

    const data = await getUsersListService({
      page: page as string,
      limit: limit as string,
      search: search as string,
    });

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
