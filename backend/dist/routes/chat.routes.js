"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const router = (0, express_1.Router)();
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY,
});
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: `
You are Restro AI.

You only answer questions about this Restaurant Management App.

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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            reply: 'AI is unavailable.'
        });
    }
});
exports.default = router;
