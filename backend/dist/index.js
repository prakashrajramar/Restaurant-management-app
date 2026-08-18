"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const food_routes_1 = __importDefault(require("./routes/food.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const table_routes_1 = __importDefault(require("./routes/table.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use('/api/food', food_routes_1.default);
app.use('/api/customers', customer_routes_1.default);
app.use('/api/tables', table_routes_1.default);
app.use('/api/bookings', booking_routes_1.default);
app.use('/api/invoices', invoice_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
// Health check endpoint
app.get('/', (_req, res) => res.json({ status: 'OK', service: 'Restaurant Management API' }));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`🚀 Backend API Server running on http://localhost:${PORT}`);
});
