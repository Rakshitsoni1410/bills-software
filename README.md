# Bills software — GST Billing Software for Indian Business

BillKaro is a full-stack GST billing and invoicing platform built for Indian small businesses, retailers, and traders. It replaces manual khata books and spreadsheet billing with auto-generated GST-compliant invoices, customer management, and udhaar (credit) tracking — all in one place.

**Live demo:** https://bills-software.netlify.app
**Repository:** https://github.com/Rakshitsoni1410/bills-software

## Features

- **GST invoice generator** — create Tax Invoices, Quotations, or Proforma Invoices with automatic CGST/SGST calculation across multiple tax slabs (0%, 5%, 12%, 18%, 28%)
- **Auto-generated invoice numbers** — invoices are numbered automatically per business per day in the format `BUSINESSNAME-YYYYMMDD-001`, with an atomic counter that guarantees no duplicate numbers even under concurrent requests
- **Customer database** — save customer details once and reuse them across invoices; new customers are saved automatically when typed manually
- **Khata / Udhaar ledger** — track credit given to customers and payments received, with udhaar entries auto-created when an invoice is marked as credit
- **Dashboard analytics** — total sales, GST collected, pending udhaar, and a breakdown of revenue by GST rate
- **WhatsApp bill sharing** — generate a formatted bill summary and share it directly via WhatsApp
- **Print / PDF export** — print-ready invoice layout with amount-in-words conversion (Indian numbering: lakhs, crores)
- **Authentication** — secure signup/login with JWT stored in an httpOnly cookie, scoped per business account

## Tech stack

**Frontend:** React (Vite), React Router, Tailwind CSS
**Backend:** Node.js, Express
**Database:** MongoDB with Mongoose
**Auth:** JWT in httpOnly cookies, bcrypt password hashing
**Deployment:** Netlify (frontend), Render (backend), MongoDB Atlas (database)

## Project structure

```
bills-software/
├── client/                 React + Vite frontend
│   └── src/
│       ├── api/             fetch wrapper for backend calls
│       ├── context/         auth state (AuthContext)
│       ├── components/      shared UI (Navbar, Badge, InvoicePrint, etc.)
│       └── pages/           Dashboard, Billing, Customers, Khata, Invoices, Login, Signup
└── server/                 Express + MongoDB backend
    ├── models/              User, Customer, Invoice, Khata, Counter
    ├── middleware/           JWT auth guard
    └── routes/              auth, customers, invoices, khata, dashboard
```

## Running locally

**Backend:**
```bash
cd server
npm install
cp .env.example .env   # add your MongoDB URI and a JWT secret
npm run dev
```

**Frontend:**
```bash
cd client
npm install
cp .env.example .env.local   # set VITE_API_URL to your local backend
npm run dev
```

The backend runs on `localhost:5000`, the frontend on `localhost:5173`.

## Deployment notes

The frontend and backend are deployed on separate domains (Netlify and Render), which requires cross-site cookie handling: in production, auth cookies use `sameSite: "none"` with `secure: true`, and CORS is restricted to the configured `CLIENT_URL`. See `server/server.js` for the exact configuration.

## Author

Built by [Rakshit Soni](https://github.com/Rakshitsoni1410).
