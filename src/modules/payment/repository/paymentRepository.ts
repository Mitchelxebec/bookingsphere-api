import { eq } from "drizzle-orm";
import { db } from "../../../infrastructure/db/connection.js";
import { payments } from "../../../infrastructure/db/schema/payments.js";

export const createPayment = async (
  reservationId: string,
  userId: string,
  amount: string,
  paystackReference: string,
  paystackAccessCode: string,
) => {
  const [paying] = await db
    .insert(payments)
    .values({
      reservationId: reservationId,
      userId: userId,
      amount: amount,
      paystackReference: paystackReference,
      paystackAccessCode: paystackAccessCode,
      status: "PENDING",
    })
    .returning();

  return paying ?? null;
};

export const findPaymentByReference = async (paystackReference: string) => {
  const [reference] = await db
    .select()
    .from(payments)
    .where(eq(payments.paystackReference, paystackReference))
    .limit(1);

  return reference ?? null;
};

export const findPaymentByReservationId = async (reservationId: string) => {
  const [reserve] = await db
    .select()
    .from(payments)
    .where(eq(payments.reservationId, reservationId))
    .limit(1);

  return reserve ?? null;
};

export const updatePaymentStatus = async (
  paystackReference: string,
  data: {
    status: "COMPLETED" | "FAILED" | "REFUNDED" | "CHARGEBACK";
    paymentMethod?: string;
    failureReason?: string;
    refundedAt?: Date;
    refundedStatus?: "PENDING" | "SUCCESS" | "FAILED";
  },
) => {
  const [updated] = await db
    .update(payments)
    .set({
      status: data.status,
      ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
      ...(data.failureReason && { failureReason: data.failureReason }),
      ...(data.refundedAt && { refundedAt: data.refundedAt }),
      ...(data.refundedStatus && { refundedStatus: data.refundedStatus }),
    })
    .where(eq(payments.paystackReference, paystackReference))
    .returning();

  return updated ?? null;
};
