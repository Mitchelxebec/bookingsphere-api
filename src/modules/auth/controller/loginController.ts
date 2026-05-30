import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../shared/utils/ApiError.js";
import { login } from "../service/loginService.js";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      throw new ApiError(400, "Missing required fields: email, or password");
    }

    const { email, password } = req.body;

    const { user, tokens } = await login({ email, password });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};
