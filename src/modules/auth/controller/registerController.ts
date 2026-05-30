import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { register } from "../service/registerService.js";

export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (
      !req.body ||
      !req.body.name ||
      !req.body.email ||
      !req.body.password
    ) {
      throw new ApiError(
        400,
        "Missing required fields: name, email, or password",
      );
    }

    const { name, email, password } = req.body;

    const { user, tokens } = await register({ name, email, password });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      user,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};
