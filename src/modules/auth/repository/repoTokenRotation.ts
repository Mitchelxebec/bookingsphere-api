import { eq, lte } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { refreshTokens } from "../../../infrastructure/db/schema/refreshTokens.js";
import { users } from "../../../infrastructure/db/schema/users.js";

export const TokenRotationRepository = {
  // Save newly generated token
  async saveToken(userId: string, token: string, expiresAt: Date) {
    await db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
    });
  },

  // Find refresh token and extract status
  async findToken(token: string) {
    const [record] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1);
    return record ?? null;
  },

  // Fetch user
  async fetchUser(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user ?? null;
  },

  //   Mark refresh token as used
  async markAsUsed(tokenId: string) {
    await db
      .update(refreshTokens)
      .set({ isUsed: true })
      .where(eq(refreshTokens.id, tokenId));
  },

  //   Breach control: Delete All tokens if used
  async revokeAllUserSessions(userId: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  },

  // Deletes tokens that are used or past their expiration date
  async purgeInvalidTokens() {
    const now = new Date();
    await db.delete(refreshTokens).where(lte(refreshTokens.expiresAt, now));
  },
};
