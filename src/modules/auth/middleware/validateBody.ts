import type { NextFunction, Request, Response } from "express";
import { z, type ZodSchema } from "zod";
import { ApiError } from "../../shared/utils/ApiError.js";

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        );

        return next(
          new ApiError(400, `Validation Failed: ${errorMessages.join(", ")}`),
        );
      }

      next(error);
    }
  };
};
