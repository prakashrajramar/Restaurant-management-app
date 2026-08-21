import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: 'system',
          content: `
You are Restro AI.

You only answer questions about this Restaurant Management App.
s
Features:
- Dashboard
- POS Billing
- Tables
- Bookings
- Customers
- Food Items
- Bills
- Reports
- Settings
- Install App

Give short and helpful answers.
`
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      reply: 'AI is unavailable.'
    });
  }
});

export default router;