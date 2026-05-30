import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";

export const requireRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles: string[] = req.user?.roles || [];

    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      next(
        new ApiError(
          403,
          "Access denied. You don't have required role permissions ",
        ),
      );
    }
  };
};
