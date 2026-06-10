import { z } from "zod";

const UserRoleEnum = z.enum(["GUEST", "PROPRIETOR", "ADMIN"]);

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid target user ID format" }),
  }),
  body: z.object({
    newRole: z
      .array(UserRoleEnum)
      .min(1, { message: "At least one role assignment is required" })
      .transform((roles) => Array.from(new Set(roles))),
  }),
});

export const banUserSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid target user ID format" }),
  }),
  body: z.object({
    reason: z
      .string()
      .trim()
      .min(5, { message: "Ban reason must be at least 5 characters long" })
      .max(500, { message: "Ban reason cannot exceed 500 characters" }),
  }),
});

export const unbanUserSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid target user ID format" }),
  }),
  body: z.object({}).strict(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type UnBanUserInput = z.infer<typeof unbanUserSchema>;
