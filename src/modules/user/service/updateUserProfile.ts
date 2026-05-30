import { ApiError } from "../../shared/utils/ApiError.js";
import {
  findUserById,
  updateProfileData,
  type UpdateProfilePayload,
} from "../repository/userRepo.js";

export const updateMyAccount = async (
  userId: string,
  updateData: UpdateProfilePayload,
) => {
  const userInfo = await findUserById(userId);
  if (!userInfo) throw new ApiError(404, "Account does not exist");

  if (userInfo.deleted_at) throw new ApiError(400, "Account has been deleted");

  const updatedInfo = await updateProfileData(userId, updateData);
  if (!updatedInfo) throw new ApiError(410, "This account no longer exists");

  const { password_hash, ...user } = updatedInfo;

  return user;
};
