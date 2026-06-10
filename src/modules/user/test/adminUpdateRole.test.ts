import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateUserRole } from "../service/adminUpdateRole.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import * as adminRepo from "../repository/adminRepo.js";

// Mock the repository layer completely
vi.mock("../repository/adminRepo.js", () => ({
  getUserById: vi.fn(),
  updateUserRoleRepo: vi.fn(),
}));

describe("updateUserRole Service Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail if a user tries to modify their own role", async () => {
    await expect(
      updateUserRole({
        targetUserId: "user-123",
        newRole: ["ADMIN"],
        actorUserId: "user-123", // Same ID!
        actorRoles: ["SUPERADMIN"],
      }),
    ).rejects.toThrowError(
      new ApiError(400, "You cannot change your own role"),
    );
  });

  it("should fail if a regular user tries to call the service", async () => {
    await expect(
      updateUserRole({
        targetUserId: "target-456",
        newRole: ["PROPRIETOR"],
        actorUserId: "actor-123",
        actorRoles: ["GUEST"], // Low level role
      }),
    ).rejects.toThrowError(
      new ApiError(
        403,
        "Access denied: Insufficient administrative privileges",
      ),
    );
  });

  it("should fail if the target user does not exist", async () => {
    vi.mocked(adminRepo.getUserById).mockResolvedValue(null);

    await expect(
      updateUserRole({
        targetUserId: "non-existent",
        newRole: ["PROPRIETOR"],
        actorUserId: "admin-123",
        actorRoles: ["ADMIN"],
      }),
    ).rejects.toThrowError(new ApiError(404, "Target user account not found"));
  });

  it("should block a regular ADMIN from modifying a SUPERADMIN account", async () => {
    vi.mocked(adminRepo.getUserById).mockResolvedValue({
      id: "super-456",
      roles: ["SUPERADMIN"],
    } as any);

    await expect(
      updateUserRole({
        targetUserId: "super-456",
        newRole: ["GUEST"],
        actorUserId: "admin-123",
        actorRoles: ["ADMIN"], // Regular admin actor
      }),
    ).rejects.toThrowError(
      new ApiError(403, "Super Admins cannot be modified by anyone"),
    );
  });

  it("should block a regular ADMIN from promoting anyone to ADMIN or SUPERADMIN", async () => {
    vi.mocked(adminRepo.getUserById).mockResolvedValue({
      id: "guest-456",
      roles: ["GUEST"],
    } as any);

    await expect(
      updateUserRole({
        targetUserId: "guest-456",
        newRole: ["ADMIN"], // Trying to promote to admin tier
        actorUserId: "admin-123",
        actorRoles: ["ADMIN"],
      }),
    ).rejects.toThrowError(
      new ApiError(
        403,
        "Regular Admins cannot promote users to Admin or Super Admin tiers",
      ),
    );
  });

  it("should allow a SUPERADMIN to successfully promote a user to ADMIN", async () => {
    vi.mocked(adminRepo.getUserById).mockResolvedValue({
      id: "guest-456",
      roles: ["GUEST"],
    } as any);

    vi.mocked(adminRepo.updateUserRoleRepo).mockResolvedValue({
      success: true,
    } as any);

    const result = await updateUserRole({
      targetUserId: "guest-456",
      newRole: ["ADMIN"],
      actorUserId: "super-123",
      actorRoles: ["SUPERADMIN"],
    });

    expect(result).toEqual({ success: true });
    expect(adminRepo.updateUserRoleRepo).toHaveBeenCalledWith(
      "guest-456",
      ["ADMIN"],
      "super-123",
    );
  });
});
