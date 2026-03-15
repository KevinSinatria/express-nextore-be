# 🏪 Nextore Backend API

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=flat-square)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better--Auth-111111?style=flat-square)](https://www.better-auth.com/)

[English](#english) | [Bahasa Indonesia](#bahasa-indonesia)

---

## English

**Nextore Backend** is a RESTful API designed as the backbone for the Nextore retail ecosystem. Built with a focus on security, scalability, and ease of integration to support modern retail operations.

### 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: [Better Auth](https://www.better-auth.com/) (Session & JWT)
- **Database**: PostgreSQL
- **Documentation**: OpenAPI 3.0 / Swagger

### ✨ Key Features

- 🔐 **Role-based Access Control (RBAC)**: Access restricted by roles (Admin, Supervisor, and Cashier).
- 📦 **Product & Category Management**: Full CRUD API for managing inventory and product grouping.
- 💸 **Transaction & Sales Logic**: Transaction recording integrated with member data and discounts.
- 📊 **Stock/Inventory Management**: Real-time stock monitoring with low-stock alerts.
- 🎟️ **Discounts & Member System**: Flexible discount settings and loyalty points management.
- 📄 **API Documentation**: Secure interactive documentation, protected by Basic Auth.

### 🚀 Getting Started

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd express-nextore-be
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Environment Setup**
   Copy `.env.example` to `.env` and fill in the necessary variables.
4. **Database Configuration**
   ```bash
   npm run db:push
   # or
   npx prisma migrate dev
   ```
5. **Run Server**
   ```bash
   npm run dev
   ```

### 📖 API Documentation

Access via: 👉 `http://localhost:5000/docs`
_Use `SWAGGER_USER` and `SWAGGER_PASSWORD` from your `.env` to login._

---

## Bahasa Indonesia

**Nextore Backend** adalah RESTful API yang dirancang sebagai tulang punggung (backbone) ekosistem retail Nextore. Dibangun dengan fokus pada keamanan, skalabilitas, dan kemudahan integrasi untuk mendukung operasional toko modern.

### 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Database**: PostgreSQL
- **Documentation**: OpenAPI 3.0 / Swagger

### ✨ Fitur Utama

- 🔐 **Role-based Access Control (RBAC)**: Pembatasan akses berdasarkan peran (Admin, Supervisor, dan Kasir).
- 📦 **Manajemen Produk & Kategori**: API CRUD lengkap untuk pengelolaan stok barang dan pengelompokan produk.
- 💸 **Logika Transaksi & Penjualan**: Sistem pencatatan transaksi yang terintegrasi dengan data member dan diskon.
- 📊 **Manajemen Stok/Inventory**: Pemantauan stok real-time dengan fitur _low-stock alert_.
- 🎟️ **Sistem Diskon & Member**: Pengaturan diskon fleksibel dan manajemen poin loyalitas pelanggan.
- 📄 **API Documentation**: Dokumentasi interaktif yang aman, terlindungi oleh _Basic Auth_.

### 🚀 Memulai (Getting Started)

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd express-nextore-be
   ```
2. **Instalasi Dependencies**
   ```bash
   npm install
   ```
3. **Konfigurasi Environment (`.env`)**
   Salin `.env.example` menjadi `.env` dan lengkapi variabel yang dibutuhkan.
4. **Konfigurasi Database**
   ```bash
   npm run db:push
   # atau
   npx prisma migrate dev
   ```
5. **Jalankan Server**
   ```bash
   npm run dev
   ```

### 📖 API Documentation

Dapat diakses melalui: 👉 `http://localhost:5000/docs`
_Gunakan `SWAGGER_USER` dan `SWAGGER_PASSWORD` dari file `.env` untuk login._

---

## 📂 Project Structure

```text
src/
├── config/       # Configurations (Database, Env)
├── lib/          # Library initializations (Auth)
├── middlewares/  # Express middlewares (Auth, Validation)
├── modules/      # Feature modules (Products, Transactions, etc.)
│   └── [feature]/
│       ├── [feature].controller.ts
│       ├── [feature].route.ts
│       ├── [feature].schema.ts
│       └── [feature].service.ts
├── utils/        # Utility functions (sendResponse, slug, etc.)
├── app.ts        # Primary Express setup
└── server.ts     # Application entry point
```

## 📄 License

Copyright © 2026 **Kevin Sinatria**. Prepared for Internship/PKL activities.
