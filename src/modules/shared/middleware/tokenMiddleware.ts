import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { isTokenBlacklisted } from "../../../infrastructure/cache/redis.js";

interface UserPayload {
  userId: string;
  roles: string[];
}

export const userToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Access denied. Authentication token missing"));
  }

  const accessToken = authHeader.split(" ")[1];

  if (!accessToken) {
    return next(new ApiError(401, "Access denied. Token payload is empty"));
  }

  try {
    const isBlacklisted = await isTokenBlacklisted(accessToken);
    if (isBlacklisted) {
      return next(new ApiError(401, "Access denied. This token has been revoked via logout."));
    }

    const decoded: UserPayload = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET!,
    ) as UserPayload;

    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(401, "Access denied. Invalid or expired token"));
  }
};
