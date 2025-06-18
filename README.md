# 🛒 Grocery Guardian

**Grocery Guardian** is a modern and minimalistic shared grocery list and inventory management web app built with TypeScript, Node.js, and MongoDB. Designed for families and housemates, it helps you track grocery needs and pantry inventory in real-time — without the fluff.

## 🚀 Features

- ✅ Add, edit, and delete grocery items
- 🔁 Reuse frequently bought items with history tracking
- 📦 Keep tabs on your pantry stock
- 📲 Mobile-friendly responsive UI (SPA-like experience using vanilla JavaScript)
- 📷 Barcode scanning support for quick item entry
- ☁️ Data persistence via MongoDB backend
- 👥 User accounts with login/signup
- 🔐 Auth-protected dashboard
- 📋 Add multiple items and sync with the server in one go

## 🧠 Tech Stack

### Frontend
- Vanilla JavaScript (Modular, SPA-style routing)
- TypeScript
- HTML & CSS (custom styles, no frameworks)
- LocalStorage for temporary item storage

### Backend
- Node.js + Express
- MongoDB (via Mongoose)
- TypeScript
- RESTful API
- JWT-based authentication


## 🛠 Setup & Run Locally

### 1. Clone the Repo

```bash
git clone https://github.com/sahashiharshit/groceryguardian.git
cd groceryguardian
### Backend Setup
cd backend
npm install
cp .env.example .env
# Fill in your environment variables (MongoDB URI, JWT_SECRET, etc.)
npm run dev

### Frontend Setup
cd public
npm install
npm run dev
