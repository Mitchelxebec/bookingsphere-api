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

  // Whitelist only the fields a user is permitted to change
  const safeData: UpdateProfilePayload = {};
  if (updateData.name !== undefined) safeData.name = updateData.name;
  if (updateData.phone !== undefined) safeData.phone = updateData.phone;
  if (updateData.email !== undefined) safeData.email = updateData.email;

  if (Object.keys(safeData).length === 0)
    throw new ApiError(400, "No valid fields provided to update");

  const updatedInfo = await updateProfileData(userId, safeData);
  if (!updatedInfo) throw new ApiError(410, "This account no longer exists");

  const { password_hash, ...user } = updatedInfo;

  return user;
};
