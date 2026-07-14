import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { isTokenBlacklisted } from "../../../infrastructure/cache/redis.js";

interface JwtUserPayload {
  userId: string;
  roles?: ("GUEST" | "PROPRIETOR" | "ADMIN" | "SUPERADMIN")[];
  proprietorStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
}

export const socketAuth = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    // 1. Extract token from handshake auth or headers
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) return next(new Error("Authentication error: Token missing"));

    // Check if the token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(
        new Error("Access denied. This token has been revoked via logout."),
      );
    }

    // 2. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as JwtUserPayload;

    // 3. Attach user payload exactly like your Express Request type
    socket.data.user = {
      userId: decoded.userId,
      roles: decoded.roles,
      proprietorStatus: decoded.proprietorStatus,
    };

    next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid or expired token"));
  }
};
