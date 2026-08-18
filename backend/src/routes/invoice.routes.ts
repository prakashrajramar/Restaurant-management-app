import { Router } from 'express';
import { prisma } from '../db';
import { getSettings } from '../settings';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, paymentMethod, from, to } = req.query;
    const where: any = {};
    if (paymentMethod && paymentMethod !== 'ALL') where.paymentMethod = String(paymentMethod);
    if (search) where.OR = [
      { invoiceNumber: { contains: String(search) } },
      { customer: { name: { contains: String(search) } } },
      { customer: { phone: { contains: String(search) } } },
    ];
    if (from || to) where.createdAt = {};
    if (from) where.createdAt.gte = new Date(String(from) + 'T00:00:00');
    if (to) where.createdAt.lte = new Date(String(to) + 'T23:59:59.999');
    const invoices = await prisma.invoice.findMany({ where, include: { customer: true, table: true, items: { include: { foodItem: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(invoices);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed to fetch invoices' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id }, include: { customer: true, table: true, items: { include: { foodItem: true } } } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch invoice' }); }
});

router.post('/', async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, tableId, items, discount, paymentMethod, amountReceived } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Invoice must contain at least one food item' });
    const settings = getSettings();
    let finalCustomerId = customerId;
    if (!finalCustomerId && customerPhone) {
      let cust = await prisma.customer.findUnique({ where: { phone: customerPhone } });
      if (!cust && customerName) cust = await prisma.customer.create({ data: { name: customerName, phone: customerPhone } });
      if (cust) finalCustomerId = cust.id;
    }
    if (tableId) {
      const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
      if (!table) return res.status(400).json({ error: 'Selected table not found' });
      if (table.status !== 'AVAILABLE' && table.status !== 'OCCUPIED') return res.status(400).json({ error: 'Selected table is not available for billing' });
    }

    let subtotal = 0;
    const invoiceItemData: any[] = [];
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: 'Each item quantity must be a positive integer' });
      const foodItem = await prisma.foodItem.findUnique({ where: { id: item.foodItemId } });
      if (!foodItem || !foodItem.isAvailable) return res.status(400).json({ error: `Food item ${item.foodItemId} is unavailable` });
      const itemTotal = Math.round(foodItem.price * quantity * 100) / 100;
      subtotal += itemTotal;
      invoiceItemData.push({ foodItemId: foodItem.id, quantity, unitPrice: foodItem.price, totalPrice: itemTotal });
    }
    const discountAmount = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableSubtotal * (settings.taxRate / 100) * 100) / 100;
    const grandTotal = Math.round((taxableSubtotal + taxAmount) * 100) / 100;
    const recAmount = paymentMethod === 'CASH' ? Number(amountReceived) : grandTotal;
    if (!Number.isFinite(recAmount) || recAmount < grandTotal) return res.status(400).json({ error: 'Amount received is less than the bill total' });
    const change = Math.round((recAmount - grandTotal) * 100) / 100;

    const latest = await prisma.invoice.findFirst({ where: { invoiceNumber: { startsWith: `INV-${new Date().getFullYear()}-` } }, orderBy: { createdAt: 'desc' } });
    const lastNumber = latest ? Number(latest.invoiceNumber.split('-').pop()) || 0 : 0;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(lastNumber + 1).padStart(6, '0')}`;

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({ data: { invoiceNumber, customerId: finalCustomerId || null, tableId: tableId || null, subtotal, discount: discountAmount, tax: taxAmount, total: grandTotal, paymentMethod: paymentMethod || 'CASH', paymentStatus: 'PAID', amountReceived: recAmount, changeGiven: change, items: { create: invoiceItemData } }, include: { customer: true, table: true, items: { include: { foodItem: true } } } });
      for (const item of invoiceItemData) await tx.foodItem.update({ where: { id: item.foodItemId }, data: { totalSold: { increment: item.quantity } } });
      // A paid bill from a booked/seated table automatically completes the
      // matching booking. Prefer matching both table + customer to avoid
      // completing another booking when a table has multiple reservations.
      if (tableId) {
        const booking = await tx.booking.findFirst({
          where: {
            tableId,
            status: 'SEATED',
            ...(finalCustomerId ? { customerId: finalCustomerId } : {}),
          },
          orderBy: [{ date: 'desc' }, { time: 'desc' }, { createdAt: 'desc' }],
        });

        // If customer matching was not possible, fall back to the active
        // seated booking for this table.
        const fallbackBooking = !booking && finalCustomerId
          ? await tx.booking.findFirst({
              where: { tableId, status: 'SEATED' },
              orderBy: [{ date: 'desc' }, { time: 'desc' }, { createdAt: 'desc' }],
            })
          : null;

        const bookingToComplete = booking || fallbackBooking;
        if (bookingToComplete) {
          await tx.booking.update({
            where: { id: bookingToComplete.id },
            data: { status: 'COMPLETED' },
          });
        }

        // Keep the table in cleaning state after checkout. It can be marked
        // AVAILABLE from the Tables screen once it has been cleaned.
        await tx.restaurantTable.update({
          where: { id: tableId },
          data: { status: 'CLEANING' },
        });
      }

      if (finalCustomerId) await tx.customer.update({ where: { id: finalCustomerId }, data: { totalVisits: { increment: 1 }, totalSpent: { increment: grandTotal } } });
      return created;
    });
    res.status(201).json(invoice);
  } catch (error) { console.error('Error creating invoice:', error); res.status(500).json({ error: 'Failed to create invoice' }); }
});

export default router;
