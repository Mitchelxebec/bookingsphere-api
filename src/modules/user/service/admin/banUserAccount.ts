import { ApiError } from "../../../shared/utils/ApiError.js";
import { banUser, getUserById } from "../../repository/adminRepo.js";

interface BanUserDTO {
  targetUserId: string;
  reason: string;
  actorRole: string[];
  actorUserId: string;
}

export const banUserService = async ({
  targetUserId,
  reason,
  actorRole,
  actorUserId,
}: BanUserDTO) => {
  if (targetUserId === actorUserId)
    throw new ApiError(400, "You can't ban yourself");

  if (!reason || reason.trim().length === 0)
    throw new ApiError(400, "A reason is required to ban a user");

  const isSuperAdmin = actorRole.includes("SUPERADMIN");
  const isAdmin = actorRole.includes("ADMIN");
  if (!isSuperAdmin && !isAdmin)
    throw new ApiError(
      403,
      "Access denied: Insufficient administrative priviledges",
    );

  const targetUser = await getUserById(targetUserId);
  if (!targetUser) throw new ApiError(404, "Target account not found");
  if (targetUser.is_banned) throw new ApiError(403, "User already banned");

  const targetIsSuperAdmin = targetUser?.roles.includes("SUPERADMIN");
  const targetIsAdmin = targetUser?.roles.includes("ADMIN");

  if (targetIsSuperAdmin)
    throw new ApiError(403, "Super Admins cannot be banned by anyone");

  if (targetIsAdmin && !isSuperAdmin)
    throw new ApiError(403, "Regular Admins cannot ban other Admins");

  const bannedUser = await banUser(targetUserId, reason.trim(), actorUserId);

  return bannedUser
};
