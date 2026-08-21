import { Router } from 'express';
import Groq from 'groq-sdk';
import { PrismaClient } from '@prisma/client';

const router = Router();

const prisma = new PrismaClient();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    const q = message.toLowerCase();

    // ===== Live Database Commands =====

    // Available tables
    if (
      q.includes("available table") ||
      q.includes("available tables") ||
      q.includes("tables are available") ||
      q.includes("free table") ||
      q.includes("free tables") ||
      q.includes("how many tables are available")
    ) {
      const tables = await prisma.restaurantTable.findMany({
        where: { status: "AVAILABLE" }
      });

      return res.json({
        reply: `There are **${tables.length} available tables**.\n\n${tables
          .map((t) => `• ${t.tableNumber}`)
          .join("\n")}`
      });
    }

    // Total tables
    if (
      q.includes("how many table") ||
      q.includes("total table")
    ) {
      const total = await prisma.restaurantTable.count();

      return res.json({
        reply: `The restaurant has **${total} tables**.`
      });
    }

    // Today's bookings
    if (
      q.includes("today booking") ||
      q.includes("today bookings")
    ) {
      const today = new Date().toISOString().split("T")[0];

      const bookings = await prisma.booking.count({
        where: { date: today }
      });

      return res.json({
        reply: `Today's bookings: **${bookings}**.`
      });
    }

    // Today's revenue
    if (
      q.includes("today revenue") ||
      q.includes("today sales")
    ) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const invoices = await prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      });

      const revenue = invoices.reduce((sum, i) => sum + i.total, 0);

      return res.json({
        reply: `Today's revenue is **₹${revenue.toFixed(2)}**.`
      });
    }

    // ===== Groq AI Fallback =====

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: 'system',
          content: `
You are Restro AI, the assistant for the Restaurant Management App.

Rules:
- Answer only about this app.
- Keep replies under 80 words.
- Use numbered steps.
- Be friendly and clear.
- Don't use long paragraphs.

App Features:
- Dashboard
- POS Billing
- Tables
- Bookings
- Customers
- Food Items
- Bills & Sales
- Reports
- Settings
- Install App
`
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content || "No response."
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      reply: 'AI is unavailable.'
    });
  }
});

export default router;