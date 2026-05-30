import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../../shared/utils/ApiError.js";
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
    throw new ApiError(401, "Access denied. Authentication token missing");
  }

  const accessToken = authHeader.split(" ")[1];

  if (!accessToken) {
    throw new ApiError(401, "Access denied. Token payload is empty");
  }

  const isBlacklisted = await isTokenBlacklisted(accessToken);
  if (isBlacklisted)
    throw new ApiError(
      401,
      "Access denied. This token has been revoked via logout.",
    );

  try {
    const decoded: UserPayload = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET || "fallback_super_secret_access_key_123",
    ) as UserPayload;

    req.user = decoded;

    next();
  } catch (error) {
    throw new ApiError(401, "Access denied. Invalid or expired token");
  }
};
