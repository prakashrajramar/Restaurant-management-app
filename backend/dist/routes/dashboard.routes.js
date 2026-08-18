"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const period = String(req.query.period || 'today');
        const now = new Date();
        let from;
        if (period === 'today') {
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        else if (period === 'week') {
            from = new Date(now);
            from.setDate(now.getDate() - 6);
            from.setHours(0, 0, 0, 0);
        }
        else if (period === 'month') {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const where = from ? { createdAt: { gte: from, lte: now }, paymentStatus: 'PAID' } : { paymentStatus: 'PAID' };
        const invoices = await db_1.prisma.invoice.findMany({ where, include: { items: { include: { foodItem: true } } } });
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalBills = invoices.length;
        const avgBillValue = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;
        const totalDiscounts = invoices.reduce((sum, inv) => sum + inv.discount, 0);
        const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);
        const totalCustomers = await db_1.prisma.customer.count();
        const tables = await db_1.prisma.restaurantTable.findMany();
        const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length;
        const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length;
        const reservedTables = tables.filter((t) => t.status === 'RESERVED').length;
        const cleaningTables = tables.filter((t) => t.status === 'CLEANING').length;
        const paymentSplit = {
            upi: { count: 0, amount: 0 },
            card: { count: 0, amount: 0 },
            cash: { count: 0, amount: 0 },
        };
        for (const inv of invoices) {
            const key = inv.paymentMethod === 'UPI' ? 'upi' : inv.paymentMethod === 'CARD' ? 'card' : 'cash';
            paymentSplit[key].count += 1;
            paymentSplit[key].amount += inv.total;
        }
        const grouped = new Map();
        for (const inv of invoices) {
            for (const item of inv.items) {
                const current = grouped.get(item.foodItemId) || { item: item.foodItem, sold: 0 };
                current.sold += item.quantity;
                grouped.set(item.foodItemId, current);
            }
        }
        const topFoodItems = [...grouped.values()].sort((a, b) => b.sold - a.sold).slice(0, 5).map(({ item, sold }) => ({ ...item, totalSold: sold }));
        const recentInvoices = await db_1.prisma.invoice.findMany({
            take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true, table: true, items: { include: { foodItem: true } } },
        });
        res.json({ metrics: { totalRevenue, totalBills, avgBillValue, totalDiscounts, totalTax, totalCustomers, availableTables, occupiedTables, reservedTables, cleaningTables }, paymentSplit, topFoodItems, recentInvoices });
    }
    catch (error) {
        console.error('Error generating dashboard stats:', error);
        res.status(500).json({ error: 'Failed to load dashboard metrics' });
    }
});
exports.default = router;
