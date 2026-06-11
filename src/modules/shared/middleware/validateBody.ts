import type { NextFunction, Request, Response } from "express";
import { z, type ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validateBody = (schema: ZodTypeAny) => {
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

export const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        params: req.params,
      })) as { body: any; params: any };

      req.body = parsed.body;
      Object.assign(req.params, parsed.params);
      next()
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
