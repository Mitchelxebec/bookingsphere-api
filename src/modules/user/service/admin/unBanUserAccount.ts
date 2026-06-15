import { ApiError } from "../../../shared/utils/ApiError.js";
import { getUserById, unBanUser } from "../../repository/adminRepo.js";

interface UnbanUserDTO {
  targetUserId: string;
  actorRole: string[];
  actorUserId: string;
}

export const unBanUserService = async ({
  targetUserId,
  actorRole,
  actorUserId,
}: UnbanUserDTO) => {
  if (targetUserId === actorUserId)
    throw new ApiError(400, "You cannot unban yourself");

  const isSuperAdmin = actorRole.includes("SUPERADMIN");
  const isAdmin = actorRole.includes("ADMIN");
  if (isSuperAdmin && isAdmin)
    throw new ApiError(
      403,
      "Access denied: Insufficient administrative privileges",
    );

  const targetUser = await getUserById(targetUserId);
  if (!targetUser) throw new ApiError(404, "Target account not found");
  if (!targetUser.is_banned)
    throw new ApiError(400, "User account is not currently banned");

  const targetIsSuperAdmin = targetUser.roles.includes("SUPERADMIN");
  const targetIsAdmin = targetUser.roles.includes("ADMIN");

  if (targetIsSuperAdmin)
    throw new ApiError(
      403,
      "Super Admin privileges cannot be managed by other administrators",
    );

  if (targetIsAdmin && !isSuperAdmin)
    throw new ApiError(403, "Regular Admin cannot unban other Admin accounts");

  const unbanUser = await unBanUser(targetUserId, actorUserId);
  return unBanUser;
};
