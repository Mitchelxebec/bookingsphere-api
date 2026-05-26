import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./ApiError.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.statusCode,
      message: err.message,
      stack: process.env.NODE_ENV === "development" && err.stack,
    });
  }

  //  fallback unhandled internal errors for server logs
  console.error("💥 Unhandled Error:", err);

//   Return a generic 500 status to the client so the app doesn't crash or expose internal code
return res.status(500).json({
    success: false,
    status: 500,
    message: "Something went wrong on the server",
    stack: process.env.NODE_ENV === "development" && err.stack
})
};
