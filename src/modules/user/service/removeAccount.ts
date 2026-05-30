import { ApiError } from "../../shared/utils/ApiError.js";
import { deleteUserAccount, findUserById } from "../repository/userRepo.js";

export const removeMyAccount = async (userId: string) => {
  const userInfo = await findUserById(userId);
  if (!userInfo) throw new ApiError(404, "Account does not exist");

  await deleteUserAccount(userId);

  return;
};
