import { ApiError } from "../../../shared/utils/ApiError.js";
import { getUserById, updateUserRoleRepo } from "../../repository/adminRepo.js";

interface UpdateUserDTO {
  targetUserId: string;
  newRole: ("GUEST" | "ADMIN" | "SUPERADMIN")[];
  actorRole: string[];
  actorUserId: string;
}

export const changeUserRole = async ({
  targetUserId,
  newRole,
  actorRole,
  actorUserId,
}: UpdateUserDTO) => {
  if (targetUserId === actorUserId)
    throw new ApiError(400, "You cannot change your own role");

  // 1. RUNTIME GUARD: Block manual assignments of the PROPRIETOR role
  // We use type casting (as string[]) to check raw incoming request payloads safely
  if ((newRole as string[]).includes("PROPRIETOR")) {
    throw new ApiError(
      400,
      "Bad Request: The PROPRIETOR role cannot be assigned manually. It must be granted through the KYC approval workflow.",
    );
  }

  const isSuperAdmin = actorRole.includes("SUPERADMIN");
  const isAdmin = actorRole.includes("ADMIN");
  if (!isSuperAdmin && !isAdmin)
    throw new ApiError(
      403,
      "Access denied: Insufficient Privilage to update role",
    );

  const targetUser = await getUserById(targetUserId);
  if (!targetUser) throw new ApiError(404, "User not found");

  const targetIsSuperAdmin = targetUser.roles.includes("SUPERADMIN");
  const targetIsAdmin = targetUser.roles.includes("ADMIN");

  if (targetIsSuperAdmin)
    throw new ApiError(403, "Super Admin cannot be modified");

  if (targetIsAdmin && !isSuperAdmin)
    throw new ApiError(403, "Admins cannot modify other Admins");

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

  const updatedUser = await updateUserRoleRepo(
    targetUserId,
    newRole,
    actorUserId,
  );

  return updatedUser;
};
