import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

export const requireRoles = (
  allowedRoles: ("GUEST" | "PROPRIETOR" | "ADMIN" | "SUPERADMIN")[],
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));

    const userRoles: string[] = req.user?.roles || [];
    const hasPermission = userRoles.some((role) => allowedRoles.includes(role as any));

    if (!hasPermission) {
      return next(
        new ApiError(
          403,
          "Access denied. You don't have required role permissions ",
        ),
      );
    }

    next();
  };
};
