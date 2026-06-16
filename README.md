# Bills -software

GST Billing, Invoice, Khata, Customer & Inventory Management Software for Indian Businesses.

## Overview

BillKaro is a modern full-stack web application designed for Indian shop owners, traders, wholesalers, retailers, and small businesses.

It helps businesses:

* Create GST invoices
* Manage customers
* Track udhaar (Khata)
* Monitor inventory
* Generate reports
* Manage business operations from a single dashboard

---

## Features

### Dashboard

* Revenue Overview
* Sales Analytics
* Pending Payments
* Customer Statistics
* GST Summary

### Customer Management

* Add/Edit/Delete Customers
* GSTIN Support
* Customer Ledger
* Customer Statements

### GST Billing

* Create GST Invoices
* Print Invoices
* PDF Export
* Invoice History
* Payment Status Tracking

### Khata (Udhaar)

* Credit Entries
* Payment Entries
* Outstanding Balances
* Customer-wise Ledger

### Inventory

* Product Management
* Stock Tracking
* Low Stock Alerts
* GST & HSN Support

### Reports

* Sales Reports
* Customer Reports
* GST Reports
* Export Data

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs

---

## Project Structure

```text
billkaro/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   └── context/
│   │
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── config/
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/billkaro.git
cd billkaro
```

### Install Frontend

```bash
cd client
npm install
```

### Install Backend

```bash
cd ../server
npm install
```

---

## Environment Variables

Create a `.env` file inside the server folder:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

## Run Development Server

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

---

## Seed Demo Data

```bash
cd server
npm run seed
```

Demo Login:

```text
Email: demo@billkaro.app
Password: demo1234
```

---

## Future Features

* WhatsApp Invoice Sharing
* Barcode Scanner
* POS Billing
* Multi-User Roles
* Expense Tracking
* E-Way Bill Support
* GST Return Assistance
* Mobile Application

---

## Target Users

* Retail Shops
* Grocery Stores
* Electronics Stores
* Traders
* Wholesalers
* Service Businesses
* Small & Medium Enterprises

---

## License

MIT License

---

Made with ❤️ for Indian Businesses.
