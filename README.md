# Bills Software — GST Billing & Invoice Management for Indian Businesses

> A modern full-stack GST billing platform for creating invoices, managing customers, tracking udhaar, recording payments, and running day-to-day billing operations.

**Bills Software** is built for Indian small businesses, retailers, traders, shop owners, and service providers who want a simpler alternative to manual billing, spreadsheets, and traditional khata books.

The application combines GST invoicing, customer management, payment tracking, invoice history, Khata management, PDF generation, WhatsApp sharing, and business settings in one responsive web application.

## Live Project

**Live Demo:** https://bills-software.netlify.app

**GitHub Repository:** https://github.com/Rakshitsoni1410/bills-software

---

## ✨ Highlights

- GST invoice generation
- Tax Invoice, Quotation and Proforma Invoice support
- Automatic invoice numbering
- Customer management and customer profiles
- Invoice editing and detailed invoice pages
- HSN / SAC support
- Units for products and services
- Item-level and invoice-level discounts
- Additional invoice charges
- Paid / Partial / Udhaar tracking
- Khata ledger integration
- Payment history
- Sandbox payment gateway
- Invoice search and advanced filters
- Print-ready invoices
- PDF generation
- WhatsApp sharing
- Business settings
- Secure authentication
- Responsive desktop and mobile UI
- Server-side invoice calculations

---

# 📄 GST Invoice Generator

Bills Software allows businesses to create:

- Tax Invoices
- Quotations
- Proforma Invoices

Supported GST rates:

```text
0%
5%
12%
18%
28%
```

Invoice calculations are handled automatically.

The backend recalculates invoice totals before saving, meaning the application does not rely only on frontend-generated totals.

---

# 🧾 Advanced Invoice Items

Each invoice can contain multiple products or services.

Every item can include:

- Description
- HSN / SAC code
- Quantity
- Unit
- Rate
- GST rate
- Discount type
- Discount amount

Example units include:

```text
Nos
Pcs
Kg
Gm
Ltr
Ml
Mtr
Sq Ft
Box
Pack
Set
Hr
Day
Service
```

---

# 💸 Discounts

Bills Software supports discounts at two different levels.

## Item-Level Discounts

Each invoice item can use:

```text
No Discount
Percentage Discount
Fixed ₹ Discount
```

For example:

```text
Item Value:        ₹10,000
Item Discount:        10%
Discount Amount:   ₹1,000
Taxable Value:     ₹9,000
```

## Invoice-Level Discounts

A discount can also be applied after all item-level discounts.

Supported types:

```text
Percentage (%)
Fixed Amount (₹)
```

---

# ➕ Extra Charges

Invoices can include custom additional charges.

Examples:

- Delivery charges
- Shipping
- Packing charges
- Transportation
- Service charges
- Handling charges
- Other custom charges

Each charge can include a custom name and amount.

---

# 🧮 Invoice Calculation

The current calculation flow is:

```text
Quantity × Rate
       ↓
Item Discount
       ↓
Item Taxable Value
       ↓
Invoice-Level Discount
       ↓
Taxable Subtotal
       ↓
CGST + SGST
       ↓
Extra Charges
       ↓
Grand Total
```

The server recalculates and validates invoice totals before storing the invoice.

---

# 🔢 Automatic Invoice Numbering

Invoice numbers are generated automatically.

Format:

```text
BUSINESSNAME-YYYYMMDD-001
```

Example:

```text
SHREETRADERS-20260920-001
```

The application uses a database counter so invoice numbers remain unique even when multiple invoices are generated.

---

# 🏢 Business Settings

Every account can maintain its own business information.

Supported business settings include:

- Business name
- Owner name
- Phone number
- GSTIN
- Address
- City
- State
- Pincode
- Invoice prefix
- Default GST rate
- Default invoice notes
- Bank information
- UPI information
- Logo URL

These details can be reused throughout the billing workflow.

---

# 👥 Customer Management

Businesses can save customer information for faster billing.

Customer records can include:

- Customer name
- Phone number
- GSTIN
- City
- Address

When creating an invoice, businesses can either select an existing customer or enter customer information manually.

---

# 👤 Customer Profiles

Each customer can have a dedicated profile page.

A customer profile can show:

- Customer details
- Phone number
- GSTIN
- Address
- Total billed
- Amount received
- Outstanding balance
- Number of invoices
- Invoice history
- Khata history

Customer profile routes are protected and available only to authenticated users.

---

# 📋 Invoice Management

Generated invoices can be opened through a dedicated invoice details page.

Available actions include:

- View invoice
- Edit invoice
- Print invoice
- Save as PDF
- Share through WhatsApp
- View payment status
- View amount paid
- View remaining balance
- Record payments
- View payment history

---

# ✏️ Edit Existing Invoices

Existing invoices can be edited without changing their invoice number.

Editable fields include:

- Document type
- Invoice date
- Due date
- Place of supply
- Customer
- Customer GSTIN
- Customer address
- Invoice items
- HSN / SAC
- Units
- Rates
- GST
- Item discounts
- Invoice discount
- Additional charges
- Notes

When an invoice total changes, previously recorded payments remain linked and the outstanding balance is recalculated.

---

# 🔎 Invoice Search & Advanced Filters

The invoice list includes advanced searching and filtering.

Search can match information such as:

- Invoice number
- Customer name
- Customer phone
- GSTIN

Filters include:

- Payment status
- Customer
- Document type
- From date
- To date
- Minimum invoice amount
- Maximum invoice amount

Status filters include:

```text
All
Paid
Udhaar
Partial
```

Multiple filters can be combined at the same time.

---

# 💳 Payment Tracking

Each invoice tracks:

```text
Invoice Total
Amount Paid
Balance Due
Payment Status
Payment History
```

Payment status can automatically represent:

```text
Full amount received   → Paid
Some amount received   → Partial
No amount received     → Udhaar
```

---

# 💰 Supported Payment Methods

Payments can be recorded using:

- UPI
- Card
- Bank Transfer
- Net Banking
- Cash
- Cheque
- Other

Successful payments update the invoice balance automatically.

---

# 🧪 Sandbox Payment Gateway

Bills Software includes a **sandbox payment experience** designed for demonstration and development.

It provides a realistic payment workflow without transferring real money.

Sandbox transactions can simulate:

```text
Success
Pending
Failed
```

Example sandbox transaction references:

```text
UPI-SBX-482731905614
CARD-SBX-947215839201
BANK-SBX-260920483721
NB-SBX-682941375012
UTR-SBX-482731905614
```

All simulated electronic payment references contain:

```text
SBX
```

to clearly identify them as sandbox transactions.

> **Important:** The sandbox payment system does not transfer real money.

The demo interface should never collect real:

- OTPs
- UPI PINs
- ATM PINs
- Banking passwords
- Real card CVVs
- Sensitive banking credentials

Only masked display information is intended to be stored.

---

# 📒 Khata / Udhaar Ledger

Bills Software includes a Khata system for tracking customer credit.

Khata supports:

- Udhaar entries
- Received payment entries
- Customer balances
- Outstanding invoice balances
- Invoice-linked Khata records

When an invoice has an outstanding amount, the corresponding invoice-linked Khata entry can reflect that balance.

When the invoice becomes fully paid, its invoice-linked outstanding entry is removed.

Manual Khata entries remain separate.

---

# 📊 Dashboard

The dashboard provides a quick overview of business activity.

It can display information such as:

- Total sales
- GST collected
- Pending udhaar
- Number of customers
- Number of invoices
- GST collection breakdown
- Recent invoices

More advanced analytics and charts are planned for future development.

---

# 🖨️ Print & PDF Export

Invoices include a professional print-ready layout.

Invoices can be:

- Printed directly
- Saved through browser print
- Generated as PDFs
- Shared with customers

PDF generation uses:

```text
jsPDF
html2canvas
```

The invoice layout can display:

- Business information
- Customer information
- GSTIN
- Invoice number
- Invoice date
- Due date
- Place of supply
- HSN / SAC
- Unit
- Quantity
- Rate
- Discounts
- GST
- Additional charges
- Grand total
- Amount in words
- Notes / terms
- Authorized signatory section

---

# 🔤 Amount in Words

Invoice totals are converted into words using the Indian numbering system.

Supported units include:

```text
Hundreds
Thousands
Lakhs
Crores
```

Example:

```text
₹1,25,000
```

becomes:

```text
One lakh twenty five thousand rupees only
```

---

# 📱 WhatsApp Sharing

Invoice summaries can be shared directly through WhatsApp.

The message can include:

- Business name
- Invoice number
- Customer name
- Invoice items
- Subtotal
- GST
- Final amount

---

# 🎨 Application UI

Bills Software uses a responsive modern interface designed for desktop and mobile use.

UI features include:

- Responsive navigation
- Cards and tables
- Mobile invoice layouts
- Loading states
- Toast notifications
- In-page validation
- Custom confirmation dialogs
- Consistent invoice status badges

Browser-native confirmation popups have been replaced in updated workflows with reusable application UI.

---

# 🛡️ Authentication & Security

Every business account has its own authenticated data scope.

Security features include:

- JWT authentication
- httpOnly cookies
- bcrypt password hashing
- Protected backend routes
- Protected frontend routes
- User-scoped database queries
- Login attempt protection
- Temporary login lockout
- Single-device session handling
- Secure production cookies
- Server-side invoice calculations

Production cookies use:

```js
sameSite: "none";
secure: true;
```

This allows the Netlify frontend and Render backend to authenticate securely when deployed on separate domains.

---

# 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite |
| Routing | React Router |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT + httpOnly Cookies |
| Password Security | bcrypt |
| PDF Generation | jsPDF + html2canvas |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |
| Database Hosting | MongoDB Atlas |

---

# 📁 Project Structure

```text
bills-software/
│
├── client/
│   ├── src/
│   │   │
│   │   ├── api/
│   │   │   └── client.js
│   │   │
│   │   ├── components/
│   │   │   ├── Badge.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── Field.jsx
│   │   │   ├── InvoicePrint.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ...
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── BillingPage.jsx
│   │   │   ├── CustomerDetailsPage.jsx
│   │   │   ├── CustomersPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── EditInvoicePage.jsx
│   │   │   ├── InvoiceDetailsPage.jsx
│   │   │   ├── InvoicesPage.jsx
│   │   │   ├── KhataPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── ...
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── Counter.js
│   │   ├── Customer.js
│   │   ├── Invoice.js
│   │   ├── Khata.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── dashboard.js
│   │   ├── invoices.js
│   │   └── khata.js
│   │
│   └── server.js
│
└── README.md
```

---

# 🚀 Running Locally

## 1. Clone the Repository

```bash
git clone https://github.com/Rakshitsoni1410/bills-software.git

cd bills-software
```

---

## 2. Backend Setup

Move into the backend directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create/configure the backend environment file.

Example:

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

CLIENT_URL=http://localhost:5173

NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Typical development API URL:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open another terminal.

Move into the frontend directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Configure the frontend API URL.

Example:

```env
VITE_API_URL=http://localhost:5000
```

Start Vite:

```bash
npm run dev
```

Typical local frontend URL:

```text
http://localhost:5173
```

---

# ☁️ Deployment

Bills Software currently uses:

```text
Frontend   → Netlify
Backend    → Render
Database   → MongoDB Atlas
```

When a feature requires both backend and frontend changes, deploy the backend first.

Example:

```bash
git add server/models/Invoice.js
git add server/routes/invoices.js

git commit -m "feat: update invoice backend"

git push origin main
```

After the backend deployment is healthy, deploy frontend changes.

```bash
git add client/src

git commit -m "feat: update billing frontend"

git push origin main
```

---

# 🔐 Environment Variables

Sensitive values must never be committed to the repository.

Examples include:

```text
MongoDB connection strings
JWT secrets
Private API credentials
Production secrets
Banking credentials
```

Store these values in environment variables.

---

# 🔄 Backward Compatibility

New invoice functionality uses safe default values so older invoices can continue loading without requiring a database migration.

Examples:

```text
HSN / SAC              → blank
Unit                   → Nos
Item Discount          → none
Invoice Discount       → none
Extra Charge           → ₹0
Payments               → empty array
```

Legacy payment fields are handled using fallback logic when newer payment information does not exist.

---

# ✅ Development Progress

## Step 1 — Business Settings

- [x] Business profile
- [x] GST information
- [x] Bank / UPI fields
- [x] Default invoice settings

## Step 2 — Invoice Detail Page

- [x] Dedicated invoice page
- [x] Print
- [x] PDF
- [x] WhatsApp
- [x] Invoice status

## Step 3 — Edit Existing Invoice

- [x] Edit customer
- [x] Edit items
- [x] Edit GST
- [x] Edit dates
- [x] Preserve invoice number

## Step 4 — Payment Tracking

- [x] Amount paid
- [x] Balance due
- [x] Payment history
- [x] Partial payments
- [x] Sandbox payment gateway
- [x] UPI
- [x] Card
- [x] Bank Transfer
- [x] Net Banking
- [x] Cash
- [x] Cheque

## Step 5 — Customer Profiles

- [x] Customer details
- [x] Invoice history
- [x] Khata history
- [x] Customer financial summary

## Step 6 — Invoice Search & Filters

- [x] Search
- [x] Customer filter
- [x] Status filter
- [x] Document type
- [x] Date range
- [x] Amount range

## Step 7 — Confirmation UI

- [x] Reusable confirmation modal
- [x] Custom destructive-action UI

## Step 8 — Application Messages

- [x] In-app validation
- [x] Toast notifications
- [x] Removal of native browser dialogs from updated flows

## Step 9 — Advanced Invoice Pricing

- [x] HSN / SAC
- [x] Item units
- [x] Item discounts
- [x] Invoice-level discounts
- [x] Extra charges
- [x] Server-side calculation

---

# ⏸️ Current Stopping Point

The project is currently stable through:

```text
STEP 9 — Advanced Invoice Pricing
```

Development is intentionally paused here.

The next billing feature planned is:

```text
STEP 10 — Automatic CGST / SGST vs IGST
```

Currently, invoice tax calculation uses:

```text
CGST + SGST
```

Automatic interstate GST calculation based on the business state and place of supply has **not yet been implemented**.

---

# 🗺️ Roadmap

Planned future improvements include:

- [ ] Automatic CGST / SGST vs IGST
- [ ] Business logo on invoices
- [ ] Bank details on invoices
- [ ] UPI QR code on invoices
- [ ] Products catalogue
- [ ] Inventory management
- [ ] Stock tracking
- [ ] Advanced dashboard charts
- [ ] Business reports
- [ ] CSV export
- [ ] Excel export
- [ ] Customer statements
- [ ] Expense management
- [ ] Purchase invoices
- [ ] Credit notes
- [ ] Mobile billing improvements
- [ ] Dark mode
- [ ] Multi-user staff accounts
- [ ] Public landing page
- [ ] PWA support
- [ ] Installable application
- [ ] Offline billing support

---

# 🌐 Live Application

**Bills Software**

https://bills-software.netlify.app

---

# 💻 GitHub Repository

https://github.com/Rakshitsoni1410/bills-software

---

# 👨‍💻 Author

Built by **Rakshit Soni**

GitHub:

https://github.com/Rakshitsoni1410

---

# 📜 License

This repository is currently maintained as the **Bills Software** project.

No open-source license is currently specified.

If the project is released as open source in the future, a license such as the **MIT License** can be added in a `LICENSE` file.

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a star.

It helps support the project and its continued development.