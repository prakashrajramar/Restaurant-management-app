import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET bookings (with filter by status or date)
router.get('/', async (req, res) => {
  try {
    const { status, date, search } = req.query;

    const where: any = {};
    const requestedStatus = status ? String(status).toUpperCase() : 'ALL';

    // The UI tabs are not all database statuses.
    // Today/Upcoming are date-based filters, while Completed/Cancelled are status filters.
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (requestedStatus === 'TODAY') {
      where.date = today;
    } else if (requestedStatus === 'UPCOMING') {
      where.date = { gt: today };
      where.status = { notIn: ['COMPLETED', 'CANCELLED'] };
    } else if (requestedStatus === 'COMPLETED' || requestedStatus === 'CANCELLED') {
      where.status = requestedStatus;
    } else if (requestedStatus !== 'ALL') {
      where.status = requestedStatus;
    }

    if (date) {
      where.date = String(date);
    }
    if (search) {
      where.OR = [
        { bookingNumber: { contains: String(search) } },
        { customer: { name: { contains: String(search) } } },
        { customer: { phone: { contains: String(search) } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: true,
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST create new booking
router.post('/', async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, tableId, date, time, guests, notes } = req.body;

    if (!date || !time || !guests) {
      return res.status(400).json({ error: 'Date, time, and guests count are required' });
    }

    let finalCustomerId = customerId;

    // Auto-create customer if phone/name provided without customerId
    if (!finalCustomerId && customerPhone && customerName) {
      let cust = await prisma.customer.findUnique({ where: { phone: customerPhone } });
      if (!cust) {
        cust = await prisma.customer.create({
          data: { name: customerName, phone: customerPhone },
        });
      }
      finalCustomerId = cust.id;
    }

    if (!finalCustomerId) {
      return res.status(400).json({ error: 'Customer information is required for booking' });
    }

    // Check table availability and prevent overlapping active bookings.
    if (tableId) {
      const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
      if (!table) return res.status(400).json({ error: 'Selected table not found' });
      if (table.status === 'OCCUPIED' || table.status === 'CLEANING') return res.status(400).json({ error: 'Selected table is currently unavailable' });
      if (Number(guests) > table.capacity) return res.status(400).json({ error: `Table capacity is ${table.capacity}` });
      const overlap = await prisma.booking.findFirst({
        where: { tableId, date: String(date), time: String(time), status: { in: ['PENDING', 'RESERVED', 'SEATED'] } },
      });
      if (overlap) return res.status(409).json({ error: 'This table is already booked for the selected date and time' });
    }

    // Generate unique booking number #BK-XXXX
    const count = await prisma.booking.count();
    const bookingNumber = `#BK-${8890 + count + 1}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: finalCustomerId,
        tableId: tableId || null,
        date,
        time,
        guests: parseInt(guests, 10),
        notes: notes || '',
        status: tableId ? 'RESERVED' : 'PENDING',
      },
      include: { customer: true, table: true },
    });

    // Update table status to RESERVED if table was assigned
    if (tableId) {
      await prisma.restaurantTable.update({
        where: { id: tableId },
        data: { status: 'RESERVED' },
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PATCH update booking status (CHECK-IN / CONFIRM / CANCEL)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, tableId } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const dataToUpdate: any = { status };
    if (tableId) {
      dataToUpdate.tableId = tableId;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: { customer: true, table: true },
    });

    const targetTableId = tableId || booking.tableId;

    // Automated Table Status Syncing
    if (targetTableId) {
      if (status === 'SEATED') {
        await prisma.restaurantTable.update({
          where: { id: targetTableId },
          data: { status: 'OCCUPIED' },
        });
      } else if (status === 'RESERVED') {
        await prisma.restaurantTable.update({
          where: { id: targetTableId },
          data: { status: 'RESERVED' },
        });
      } else if (status === 'CANCELLED' || status === 'COMPLETED') {
        await prisma.restaurantTable.update({
          where: { id: targetTableId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
