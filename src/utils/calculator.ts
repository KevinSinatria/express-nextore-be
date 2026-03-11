export const calculateDiscountedPrice = (
  originalPrice: number,
  discount: { type: "PERCENTAGE" | "FIXED_AMOUNT"; value: number },
) => {
  if (discount.type === "PERCENTAGE") {
    return originalPrice - originalPrice * (discount.value / 100);
  }
  return Math.max(0, originalPrice - discount.value);
};
