import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  roles: string[];
}

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "fallback_super_secret_access_key_123";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fallback_super_refresh_access_key_456";

export const TokenService = {
  // Short-lived Access Token (used to authorize API requests)
  generateAccessToken(payload: TokenPayload) {
    return jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: "15m",
    });
  },

  // Long-lived Refresh Token (used to obtain new access tokens)
  generateRefreshToken(payload: TokenPayload) {
    return jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: "7d",
    });
  },

  // Generate both tokens simultaneously
  generateTokenPair(payload: TokenPayload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  },
};
