import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { TokenRotationRepository } from "../repository/repoTokenRotation.js";
import { blacklistToken } from "../../../infrastructure/cache/redis.js";

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const myRefreshToken = req.cookies.refreshToken;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      throw new ApiError(401, "Access denied. Authentication token missing");

    if (!myRefreshToken) {
      throw new ApiError(401, "No refresh token found in cookies!");
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken)
      throw new ApiError(401, "Access denied. Token payload is empty");

    // 1. DYNAMIC BLACKLIST CHECK: Decode token without validating expiration limits
    const decoded = jwt.decode(accessToken) as jwt.JwtPayload | null;
    let timeLeftInSeconds = 0;

    if (decoded && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      timeLeftInSeconds = decoded.exp - currentTime;
    }

    if (timeLeftInSeconds > 0) {
      await blacklistToken(accessToken, timeLeftInSeconds);
    }

    // 2. FIND REFRESH TOKEN IN DB AND MARK AS USED
    const tokenRecord = await TokenRotationRepository.findToken(myRefreshToken);
    if (!tokenRecord) throw new ApiError(401, "Invalid refresh token");

    await TokenRotationRepository.markAsUsed(tokenRecord.id);

    // 3. WIPE CLIENT STORAGE
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};
