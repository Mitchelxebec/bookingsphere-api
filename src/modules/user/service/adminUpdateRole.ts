import { ApiError } from "../../shared/utils/ApiError.js";
import { getUserById, updateUserRoleRepo } from "../repository/adminRepo.js";

interface UpdateRoleDTO {
  targetUserId: string;
  newRole: ("GUEST" | "PROPRIETOR" | "ADMIN" | "SUPERADMIN")[];
  actorUserId: string;
  actorRoles: string[];
}

export const updateUserRole = async ({
  targetUserId,
  newRole,
  actorUserId,
  actorRoles,
}: UpdateRoleDTO) => {
  if (targetUserId === actorUserId)
    throw new ApiError(400, "You cannot change your own role");

  // STOPS NON SUPER ADMINS FROM UPDATING ROLES
  const isSuperAdmin = actorRoles.includes("SUPERADMIN");
  const isAdmin = actorRoles.includes("ADMIN");
  if (!isSuperAdmin && !isAdmin)
    throw new ApiError(
      403,
      "Access denied: Insufficient administrative privileges",
    );

  const targetUser = await getUserById(targetUserId);
  if (!targetUser) throw new ApiError(404, "Target user account not found");

  const targetIsSuperAdmin = targetUser.roles.includes("SUPERADMIN");
  const targetIsAdmin = targetUser.roles.includes("ADMIN");

  if (targetIsSuperAdmin)
    throw new ApiError(403, "Super Admins cannot be banned by anyone");

  if (targetIsAdmin && !isSuperAdmin)
    throw new ApiError(
      403,
      "Regular Admins cannot modify other Admins or Super Admin",
    );

  if (!isSuperAdmin) {
    const tryingToPromoteToAdminTier =
      newRole.includes("ADMIN") || newRole.includes("SUPERADMIN");
    if (tryingToPromoteToAdminTier) {
      throw new ApiError(
        403,
        "Regular Admins cannot promote users to Admin or Super Admin tiers",
      );
    }
  }

  return await updateUserRoleRepo(targetUserId, newRole, actorUserId);
};
