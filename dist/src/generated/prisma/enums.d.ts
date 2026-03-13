export declare const Role: {
    readonly ADMIN: "ADMIN";
    readonly SUPERVISOR: "SUPERVISOR";
    readonly CASHIER: "CASHIER";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const DiscountType: {
    readonly PERCENTAGE: "PERCENTAGE";
    readonly FIXED_AMOUNT: "FIXED_AMOUNT";
};
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];
export declare const TransactionStatus: {
    readonly COMPLETED: "COMPLETED";
    readonly PENDING: "PENDING";
    readonly CANCELLED: "CANCELLED";
};
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];
//# sourceMappingURL=enums.d.ts.map