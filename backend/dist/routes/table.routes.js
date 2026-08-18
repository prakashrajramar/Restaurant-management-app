"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET all tables
router.get('/', async (_req, res) => {
    try {
        const tables = await db_1.prisma.restaurantTable.findMany({
            orderBy: { tableNumber: 'asc' },
            include: {
                bookings: {
                    where: { status: { in: ['RESERVED', 'SEATED'] } },
                    include: { customer: true },
                },
            },
        });
        res.json(tables);
    }
    catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
});
// POST create table
router.post('/', async (req, res) => {
    try {
        const { tableNumber, capacity, status } = req.body;
        if (!tableNumber || !capacity) {
            return res.status(400).json({ error: 'Table number and capacity are required' });
        }
        const existing = await db_1.prisma.restaurantTable.findUnique({ where: { tableNumber } });
        if (existing) {
            return res.status(400).json({ error: 'Table number already exists' });
        }
        const table = await db_1.prisma.restaurantTable.create({
            data: {
                tableNumber,
                capacity: parseInt(capacity, 10),
                status: status || 'AVAILABLE',
            },
        });
        res.status(201).json(table);
    }
    catch (error) {
        console.error('Error creating table:', error);
        res.status(500).json({ error: 'Failed to create table' });
    }
});
// PATCH update table status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status provided' });
        }
        const table = await db_1.prisma.restaurantTable.update({
            where: { id: req.params.id },
            data: { status },
        });
        res.json(table);
    }
    catch (error) {
        console.error('Error updating table status:', error);
        res.status(500).json({ error: 'Failed to update table status' });
    }
});
// DELETE table
router.delete('/:id', async (req, res) => {
    try {
        await db_1.prisma.restaurantTable.delete({ where: { id: req.params.id } });
        res.json({ message: 'Table deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting table:', error);
        res.status(500).json({ error: 'Failed to delete table' });
    }
});
exports.default = router;
