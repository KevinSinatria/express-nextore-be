export const calculateDiscountedPrice = (originalPrice, discount) => {
    if (discount.type === "PERCENTAGE") {
        return originalPrice - originalPrice * (discount.value / 100);
    }
    return Math.max(0, originalPrice - discount.value);
};
//# sourceMappingURL=calculator.js.map