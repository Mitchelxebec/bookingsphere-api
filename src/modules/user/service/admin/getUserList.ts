import { getAllUserInfo } from "../../repository/adminRepo.js";

export const getAllUserService = async (
  page?: string,
  limit?: string,
  search?: string,
) => {
  const parsedPage = Math.max(1, parseInt(page ?? "1") || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit ?? "20") || 20));

  const allUsers = await getAllUserInfo(parsedPage, parsedLimit, search);
  return allUsers;
};
