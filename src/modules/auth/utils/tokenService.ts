import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  roles: string[];
  proprietorStatus: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables. Refusing to start.",
  );
}

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
