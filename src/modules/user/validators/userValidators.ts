import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .trim()
      .optional(),
    phone: z
      .string()
      .max(20, "Phone number cannot exceed 20 characters")
      .trim()
      .optional(),
    email: z
      .string()
      .email("Invalid email address format")
      .max(255, "Email is too long")
      .toLowerCase()
      .trim()
      .optional(),
  })
  .strict(); // rejects any extra keys like roles, password_hash, etc.

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
