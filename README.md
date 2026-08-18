# Restaurant Management System (Prakashraj R - Heritage Modernity)

Full-stack production-ready application converted from Google Stitch Project ID `10084870089486909929`.

## Architecture & Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS (matching exact Stitch design tokens, Playfair Display & Inter fonts, Material Symbols icons)
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite + Prisma ORM

## Features Included

1. **Dashboard & Analytics**: Live revenue stats, total bills, average bill value, promotional discounts, GST tax calculations, interactive revenue trend chart, payment split breakdown (UPI, Card, Cash), and top-selling food leaderboard.
2. **Point of Sale (POS) & Billing**: Food item catalog with live category filtering, search, quantity controls (`+` / `-`), auto-calculated subtotal, 5% GST tax calculation, payment modal (Cash/UPI/Card), return balance calculator, table status updates, and 80mm thermal receipt printing.
3. **Table & Floorplan Management**: Visual floorplan cards for tables (Available, Occupied, Reserved, Cleaning), seat capacity display, one-click status transitions.
4. **Booking System**: Table reservations, guest counts, conflict checking, customer lookup/auto-registration, status flow (Pending -> Reserved -> Seated -> Completed / Cancelled).
5. **Food Inventory Management**: Menu item registry with image preview, category badge, veg/non-veg indicator, price edit, deletion, and availability toggle switch.
6. **Customer Directory**: Customer profiles, phone lookup, order history, visit counts, and lifetime spend.
7. **80mm Thermal Receipt Printing**: Dedicated CSS `@media print` formatted 80mm thermal receipt layout hiding normal UI elements during print.

## Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```
Backend API will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Application will start on `http://localhost:5173`.

## Verification & Testing Workflow

Run the full 22-step verification workflow:
1. **Food Management**: Add item, edit price, search item, toggle availability.
2. **Customer Management**: Create customer, search customer, view order history.
3. **Table & Booking**: Create booking, assign table, check-in customer to table.
4. **POS Billing**: Add items to cart, modify quantities, observe live subtotal + GST calculation.
5. **Payment & Receipt**: Process Cash/UPI/Card payment, calculate return change, print 80mm receipt.
6. **Persistence**: Refresh browser and verify SQLite database preserves all edits and new invoices.


## Current Production-Ready Improvements

- Added persistent restaurant settings (`backend/data/settings.json`) for restaurant name, address, phone, GSTIN, tax rate and printer type.
- Billing now uses the configured GST rate and the discount entered in POS.
- Invoice creation uses a database transaction and validates quantities, food availability, table availability and cash received.
- Booking creation prevents same-table/date/time conflicts and validates table capacity.
- Dashboard and Reports support Today, This Week, This Month and All Time filters.
- Sales history API supports date-range filtering.
- Added `/api/health` and `/` backend status endpoints.
- Settings page is now functional and persists changes.
- 80mm receipt uses saved restaurant settings.
- Backend TypeScript and frontend TypeScript checks pass.

## Run

Backend:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Frontend (new terminal):

```bash
cd frontend
npm install
npm run dev
```

Or install the root development dependency and run both services together:

```bash
npm install
npm run dev
```

The Vite proxy sends `/api` requests to `http://localhost:5000`.
