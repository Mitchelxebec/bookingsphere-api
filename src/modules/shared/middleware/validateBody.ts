import type { NextFunction, Request, Response } from "express";
import { z, type ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validateBody = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;

      // Only reassign body — query and params are read-only in newer Express/Node versions
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.params !== undefined) {
        Object.assign(req.params, parsed.params);
      }

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
