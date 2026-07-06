import { properties } from "../property/schema/properties.js"; // Adjust path if needed

// Infer the direct object type from your Drizzle schema
export type PropertySelect = typeof properties.$inferSelect;

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        roles: ("GUEST" | "PROPRIETOR" | "ADMIN" | "SUPERADMIN")[];
        proprietorStatus:
          | "NONE"
          | "PENDING"
          | "APPROVED"
          | "REJECTED"
          | "SUSPENDED";
      };
      property?: PropertySelect; // ◄ Better: Attached directly to the request root
    }
  }
}
