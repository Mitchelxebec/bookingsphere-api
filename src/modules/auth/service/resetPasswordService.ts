import { redis } from "../../../infrastructure/cache/redis.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { PasswordService } from "../utils/hash.js";
import { updatePasswordByEmail } from "../repository/repoLogin.js";
import { TokenRotationRepository } from "../repository/repoTokenRotation.js";

export const resetPasswordService = async (
  resetToken: string,
  newPlainPassword: string,
) => {
  const tokenKey = `password-reset:token:${resetToken}`;

  const userEmail = await redis.get(tokenKey);
  if (!userEmail)
    throw new ApiError(400, "Password reset token is invalid or has expired");

  const hashedNewPassword = await PasswordService.hash(newPlainPassword);

  const userId = await updatePasswordByEmail(userEmail, hashedNewPassword);
  if (!userId)
    throw new ApiError(500, "Failed to update your account password settings.");

  // Revoke all active sessions so stolen tokens can't be reused after a password change
  await TokenRotationRepository.revokeAllUserSessions(userId);

  await redis.del(tokenKey);

  return {
    success: true,
    message: "Your password has been changed successfully. All active sessions have been terminated.",
  };
};
