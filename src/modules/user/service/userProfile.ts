import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { findUserById } from "../repository/userRepo.js";

export const myAccount = async (userId: string) => {
  const userInfo = await findUserById(userId);
  if (!userInfo) throw new ApiError(404, "Account does not exist");

  if (userInfo.deleted_at)
    throw new ApiError(410, "This account no longer exists");

  const { password_hash, ...user } = userInfo;

  return user;
};
