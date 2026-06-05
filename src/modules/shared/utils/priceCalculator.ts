type Discount = {
  type: "percentage" | "fixed_amount";
  value: string;
  startDate: Date;
  endDate: Date;
};

type RoomTypeWithDiscount = {
  basePrice: string;
  discount: Discount | null;
};

// Calculates the active price of a room based on promotional availability window.
export const calculateActivePrice = (
  roomType: RoomTypeWithDiscount,
): number => {
  const basePrice = parseFloat(roomType.basePrice);
  if (!roomType.discount) return basePrice;

  const { type, value, startDate, endDate } = roomType.discount;
  const now = new Date();

  // Validate if current date falls cleanly inside the promotional window
  if (now < startDate || now > endDate) return basePrice;

  const discountValue = parseFloat(value);

  if (type === "percentage") {
    const savings = basePrice * (discountValue / 100);
    return Math.max(0, basePrice - savings);
  }

  if (type === "fixed_amount") {
    return Math.max(0, basePrice - discountValue);
  }

  return basePrice;
};
