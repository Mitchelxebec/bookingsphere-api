import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { rotateTokens } from "../service/refreshTokenService.js";

export const checkCookieController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const myRefreshToken = req.cookies.refreshToken;

    if (!myRefreshToken) {
      throw new ApiError(401, "No refresh token found in cookies!");
    }

    const newTokens = await rotateTokens(myRefreshToken);

    res.cookie("refreshToken", newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      accessToken: newTokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};
