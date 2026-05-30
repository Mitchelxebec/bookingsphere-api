import jwt from "jsonwebtoken";
import { ApiError } from "../../shared/utils/ApiError.js";
import { TokenRotationRepository } from "../repository/repoTokenRotation.js";
import { TokenService } from "../utils/tokenService.js";
import { db } from "../../../infrastructure/db/connection.js";
import { users } from "../../../infrastructure/db/schema/users.js";
import { eq } from "drizzle-orm";

const REFRESH_TOKEN =
  process.env.JWT_REFRESH_SECRET || "fallback_super_secret_refresh_key_456";

interface RefreshTokenPayload {
  userId: string;
  roles: ("GUEST" | "PROPRIETOR" | "ADMIN")[];
}

export const rotateTokens = async (incomingRefreshToken: string) => {
  //  verify incoming token
  let decoded: RefreshTokenPayload;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      REFRESH_TOKEN,
    ) as RefreshTokenPayload;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token signature");
  }

  const tokenRecord =
    await TokenRotationRepository.findToken(incomingRefreshToken);
  if (!tokenRecord) {
    throw new ApiError(401, "Refresh token does not exisst");
  }

  // If token is marked as used delete
  if (tokenRecord.isUsed) {
    await TokenRotationRepository.revokeAllUserSessions(decoded.userId);
    throw new ApiError(
      403,
      "Security Alert: Refresh token reuse detected! All active sessions revoked.",
    );
  }

  // Check if the users account has been deleted and Fetch users current role
  const userProfile = await TokenRotationRepository.fetchUser(tokenRecord.userId);
  if (!userProfile) throw new ApiError(404, "User does not exist");
  if (userProfile?.deleted_at) throw new ApiError(404, "User does not exist");

  //   Mark token as used
  await TokenRotationRepository.markAsUsed(tokenRecord.id);

  const currentRole = userProfile?.roles || ["GUEST"];

  //   Generate new refresh and access token
  const newTokens = TokenService.generateTokenPair({
    userId: tokenRecord.userId,
    roles: currentRole,
  });

  //   Save the brand new tokens
  const sevenDaysFomNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await TokenRotationRepository.saveToken(
    decoded.userId,
    newTokens.refreshToken,
    sevenDaysFomNow,
  );

  return newTokens;
};
