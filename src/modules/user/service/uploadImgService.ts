import { uploadToCloudinary } from "../../../infrastructure/storage/uploadToCloudinary.js";
import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { findUserById, updateAvatar } from "../repository/userRepo.js";

export const uploadService = async (userId: string, buffer: Buffer) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(401, "User does not exist");
  }

  const folderPath = "bookingsphere/avatars";
  const newAvatarUrl = await uploadToCloudinary(buffer, folderPath);

  await updateAvatar(userId, newAvatarUrl);

  return newAvatarUrl
};
