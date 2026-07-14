import { z } from "zod";

export const reservationIdSchema = z.string().uuid("Invalid reservation ID");

export type ReservationId = z.infer<typeof reservationIdSchema>;
