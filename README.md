# Bills Software — GST Billing Software for Indian Businesses

**Bills Software** is a full-stack GST billing and invoicing platform designed for Indian small businesses, retailers, traders, and shop owners.

It replaces manual khata books and spreadsheet-based billing with a simple digital workflow for creating GST invoices, managing customers, tracking udhaar, monitoring sales, and sharing bills.

**Live Demo:** https://bills-software.netlify.app
**GitHub Repository:** https://github.com/Rakshitsoni1410/bills-software

---

## Features

### GST Invoice Generator

Create:

* Tax Invoices
* Quotations
* Proforma Invoices

GST is calculated automatically across supported tax slabs:

* 0%
* 5%
* 12%
* 18%
* 28%

The system calculates subtotal, CGST, SGST, and the final invoice total automatically.

### Automatic Invoice Numbering

Invoices are assigned unique numbers automatically using the format:

```text
BUSINESSNAME-YYYYMMDD-001
```

An atomic database counter prevents duplicate invoice numbers even when multiple invoice requests are created at the same time.

### Customer Management

Save customer information once and reuse it across future invoices.

Customer records can include:

* Name
* Phone number
* GSTIN
* City
* Address

Customers entered manually while creating an invoice can also be saved automatically.

### Khata / Udhaar Ledger

Track money given on credit and payments received from customers.

The ledger supports:

* Udhaar entries
* Payment received entries
* Outstanding balance tracking
* Automatic khata entries when an invoice is marked as credit

### Dashboard Analytics

The dashboard provides a quick overview of business activity, including:

* Total sales
* Total GST collected
* Pending udhaar
* Number of customers
* Number of invoices
* GST collection breakdown by tax rate
* Recent invoices

### WhatsApp Bill Sharing

Generate a formatted invoice summary and share it directly through WhatsApp.

The shared message includes:

* Business name
* Invoice number
* Customer name
* Invoice items
* Subtotal
* GST
* Final total

### Print & PDF Export

Invoices include a print-ready layout suitable for printing or saving as PDF.

The invoice also supports amount-in-words conversion using the Indian numbering system, including:

* Thousands
* Lakhs
* Crores

### Authentication

Each business has its own account and data scope.

Authentication uses:

* JWT
* httpOnly cookies
* bcrypt password hashing
* Protected backend routes
* Business-specific data access

---

## Tech Stack

| Layer               | Technology             |
| ------------------- | ---------------------- |
| Frontend            | React + Vite           |
| Routing             | React Router           |
| Styling             | Tailwind CSS           |
| Backend             | Node.js + Express      |
| Database            | MongoDB + Mongoose     |
| Authentication      | JWT + httpOnly cookies |
| Password Security   | bcrypt                 |
| PDF Generation      | jsPDF + html2canvas    |
| Frontend Deployment | Netlify                |
| Backend Deployment  | Render                 |
| Database Hosting    | MongoDB Atlas          |

---

## Project Structure

```text
bills-software/
│
├── client/
│   └── src/
│       ├── api/
│       │   └── API client / backend request wrapper
│       │
│       ├── context/
│       │   └── Authentication state and AuthContext
│       │
│       ├── components/
│       │   ├── Navbar
│       │   ├── Badge
│       │   ├── MetricCard
│       │   ├── Field
│       │   ├── InvoicePrint
│       │   └── Shared UI components
│       │
│       └── pages/
│           ├── Dashboard
│           ├── Billing
│           ├── Customers
│           ├── Khata
│           ├── Invoices
│           ├── Login
│           └── Signup
│
└── server/
    ├── models/
    │   ├── User
    │   ├── Customer
    │   ├── Invoice
    │   ├── Khata
    │   └── Counter
    │
    ├── middleware/
    │   └── JWT authentication guard
    │
    ├── routes/
    │   ├── auth
    │   ├── customers
    │   ├── invoices
    │   ├── khata
    │   └── dashboard
    │
    └── server.js
```

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Rakshitsoni1410/bills-software.git
cd bills-software
```

### 2. Start the backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Add your MongoDB connection string and JWT secret to the `.env` file.

Example configuration:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Start the frontend

Open another terminal:

```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```

Set your local backend URL:

```env
VITE_API_URL=http://localhost:5000
```

The frontend runs on:

```text
http://localhost:5173
```

---

## Deployment

The application is deployed using:

* **Netlify** — frontend
* **Render** — backend API
* **MongoDB Atlas** — database

Because the frontend and backend run on separate domains, authentication requires cross-site cookie configuration.

In production, authentication cookies use:

```js
sameSite: "none"
secure: true
```

The backend also restricts CORS requests to the configured frontend URL using `CLIENT_URL`.

See `server/server.js` for the current production configuration.

---

## Application Workflow

A typical billing workflow looks like this:

```text
Signup / Login
      ↓
Dashboard
      ↓
Select or Add Customer
      ↓
Create Invoice
      ↓
Add Products / Services
      ↓
Automatic GST Calculation
      ↓
Generate Invoice
      ↓
Print / Save PDF / Share on WhatsApp
      ↓
Track Invoice & Udhaar
```

---

## Main Modules

### Dashboard

Provides an overview of sales, GST collection, customers, invoices, and outstanding udhaar.

### Billing

Create GST invoices, quotations, and proforma invoices with multiple GST rates.

### Customers

Maintain reusable customer information for faster billing.

### Khata

Track customer credit and received payments.

### Invoices

View previously generated invoices and filter them by payment status.

---

## Security

Bills Software uses several security measures:

* Passwords are hashed using bcrypt
* Authentication tokens are stored in httpOnly cookies
* Protected API routes require authentication
* User data is scoped to the authenticated business account
* Production cookies use secure cross-site configuration

Sensitive values such as MongoDB credentials and JWT secrets should always be stored in environment variables and must never be committed to the repository.

---

## Future Improvements

Possible future additions include:

* Inventory and stock management
* HSN / SAC support
* IGST support for interstate transactions
* Partial payment tracking
* Expense management
* Purchase invoices
* Credit notes
* Advanced reports
* CSV / Excel export
* Customer statements
* Multi-user staff accounts
* PWA / offline billing support

---

## Author

Built by **Rakshit Soni**

GitHub: https://github.com/Rakshitsoni1410

---

## License

This project is currently maintained as the **Bills Software** project.

If you plan to make the repository open source, add an appropriate license such as MIT in a `LICENSE` file.
