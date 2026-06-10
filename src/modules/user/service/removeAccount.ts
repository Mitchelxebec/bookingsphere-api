import { ApiError } from "../../shared/utils/ApiError.js";
import { deleteUserAccount, findUserById } from "../repository/userRepo.js";
import { TokenRotationRepository } from "../../auth/repository/repoTokenRotation.js";

export const removeMyAccount = async (userId: string) => {
  const userInfo = await findUserById(userId);
  if (!userInfo) throw new ApiError(404, "Account does not exist");

  // Soft-delete the account and revoke all active sessions simultaneously
  await Promise.all([
    deleteUserAccount(userId),
    TokenRotationRepository.revokeAllUserSessions(userId),
  ]);

  return;
};
