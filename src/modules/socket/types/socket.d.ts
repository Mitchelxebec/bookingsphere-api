import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    data: {
      user: {
        userId: string;
        roles: ("GUEST" | "PROPRIETOR" | "ADMIN" | "SUPERADMIN")[];
        proprietorStatus:
          | "NONE"
          | "PENDING"
          | "APPROVED"
          | "REJECTED"
          | "SUSPENDED";
      };
    };
  }
}
