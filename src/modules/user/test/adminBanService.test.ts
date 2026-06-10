import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "../../shared/utils/ApiError.js";
import * as adminRepo from "../repository/adminRepo.js";
import { banUserService } from "../service/adminBanUser.js";

vi.mock("../repository/adminRepo.js", () => ({
  getUserById: vi.fn(),
  banUser: vi.fn(),
}));

describe("banUserService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should prevent an admin from banning themselves", async () => {
    await expect(
      banUserService({
        targetUserId: "admin-123",
        reason: "Testing self ban",
        actorUserId: "admin-123",
        actorRoles: ["ADMIN"],
      }),
    ).rejects.toThrowError(new ApiError(400, "You cannot ban yourself"));
  });

  it("should throw error if ban reason is blank", async () => {
    await expect(
      banUserService({
        targetUserId: "user-456",
        reason: "   ", // Spaces only
        actorUserId: "admin-123",
        actorRoles: ["ADMIN"],
      }),
    ).rejects.toThrowError(
      new ApiError(400, "A reason is required to ban a user"),
    );
  });

  it("should block a regular ADMIN from banning another ADMIN", async () => {
    vi.mocked(adminRepo.getUserById).mockResolvedValue({
      id: "admin-456",
      roles: ["ADMIN"],
      is_banned: false,
    } as any);

    await expect(
      banUserService({
        targetUserId: "admin-456",
        reason: "Rogue activity",
        actorUserId: "admin-123",
        actorRoles: ["ADMIN"],
      }),
    ).rejects.toThrowError(
      new ApiError(403, "Regular Admins cannot ban other Admins"),
    );
  });

  it("should block a SUPERADMIN from banning another SUPERADMIN", async () => {
    vi.mocked(adminRepo.getUserById).mockResolvedValue({
      id: "super-456",
      roles: ["SUPERADMIN"],
      is_banned: false,
    } as any);

    await expect(
      banUserService({
        targetUserId: "super-456",
        reason: "Power struggle",
        actorUserId: "super-123",
        actorRoles: ["SUPERADMIN"],
      }),
    ).rejects.toThrowError(
      new ApiError(403, "Super Admins cannot be banned by anyone"),
    );
  });
});
