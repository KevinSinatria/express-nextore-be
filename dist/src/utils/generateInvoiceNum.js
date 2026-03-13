import prisma from "../config/prisma.js";
export const generateInvoiceNumber = async () => {
    const now = new Date();
    // 1. Format Tanggal (YYYYMMDD)
    const dateString = now.toISOString().slice(0, 10).replace(/-/g, ""); // Hasil: 20260310
    // 2. Hitung jumlah transaksi yang sudah ada hari ini
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    const transactionCount = await prisma.transaction.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });
    // 3. Tambah 1 untuk nomor urut dan pad (agar jadi 0001, 0002, dst)
    const nextNumber = (transactionCount + 1).toString().padStart(4, "0");
    return `INV${dateString}${nextNumber}`;
};
//# sourceMappingURL=generateInvoiceNum.js.map