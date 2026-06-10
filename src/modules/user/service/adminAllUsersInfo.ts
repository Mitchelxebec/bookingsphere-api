import { getAllUserInfo } from "../repository/adminRepo.js";

interface GetUsersDTO {
  page?: string | number;
  limit?: string | number;
  search?: string;
}

export const getUsersListService = async ({
  page,
  limit,
  search,
}: GetUsersDTO) => {
  // 1. Set smart fallback defaults if parameters are missing or broken
  const parsedPage = Math.max(1, parseInt(page as string) || 1);
  const parsedLimit = Math.max(
    1,
    Math.min(100, parseInt(limit as string) || 20),
  );

  // 2. Trim and sanitize the search input string
  const cleanSearch =
    search && search.trim() !== "" ? search.trim() : undefined;

  // 3. Call your repository function
  const result = await getAllUserInfo(parsedPage, parsedLimit, cleanSearch);

  // 4. Transform or filter sensitive data if needed before hitting the controller
  return {
    success: true,
    ...result,
  };
};
