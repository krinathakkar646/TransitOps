<p align="center">
  <img src="RouteX.png" alt="RouteX logo" width="160" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15)">
</p>

# RouteX - Smart Transport Operations Platform

> A centralized transport operations platform for managing vehicles, drivers, trips, maintenance, fuel, expenses, and fleet performance.

Built for the **Odoo Hackathon**.

🔗 **Live Demo**: [routeex.netlify.app](https://routeex.netlify.app)

---

## 📋 Problem Statement

Transport companies often manage fleets through spreadsheets and logbooks. This makes it easy to miss maintenance, assign unavailable drivers or vehicles, exceed load limits, lose track of fuel costs, and make decisions without clear operational data.

**RouteX** replaces these disconnected manual processes with a single, integrated command center for fleet managers, drivers, safety officers, and financial analysts.

---

## ⚡ Core Value Add (The RouteX Difference)

Unlike traditional static logging systems, RouteX **automates prevention** and checks core business rules in real-time before operations occur:

1. **Interactive Overload Defense**: Checks planned cargo weights against maximum capacity limits before dispatching to block overloading.
2. **Maintenance Dispatch Lock**: Automatically blocks damaged or "In Shop" vehicles from being selected for active trips.
3. **Driver Credentials Check**: Prevents assignment of drivers with expired licenses or "Suspended" safety status.
4. **Relational Database Audits**: Linking trip completion dynamically updates vehicle odometer readings and fuel expenditure logs.
5. **Tactile Micro-Animations**: Scale-and-glow interactive card overlays on all dashboard KPIs and fleet listing cards.
6. **Live Telemetry Ticker**: Horizontal marquee banner showing live status feeds of available and active vehicles.

---

## 🛠️ Beginner-Friendly Tech Stack

| Area | Technology | Why we chose it |
| --- | --- | --- |
| **Framework** | Next.js 15 (App Router) | High-performance React server components with fast APIs. |
| **Database** | Postgres (Neon Serverless) | Robust, relational database with schema integrity. |
| **ORM** | Drizzle ORM | Type-safe SQL query generation and migration management. |
| **Auth** | Better-Auth | Secure, drop-in credentials authentication with session support. |
| **Styling** | Tailwind CSS + Vanilla CSS | Vibrant HSL palettes, default dark mode, and micro-animations. |
| **Icons** | Lucide React | Clean, modern, consistent vector icon pack. |
| **Exporting** | Papa Parse & jsPDF | Native client-side CSV and PDF reports. |

---

## 🔑 Environment Variables Setup
Create a file named `.env.local` in the project root and add the following keys (see `.env.example` for reference):

```bash
# Database Connection (Postgres)
DATABASE_URL="your-postgresql-connection-string"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18 or later
* A Serverless Postgres Database (e.g. from [Neon.tech](https://neon.tech) or Supabase)

### Installation & Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/krinathakkar646/RouteX.git
   cd RouteX
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database schemas**:
   ```bash
   npm run db:push
   ```

4. **Launch the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 The Team

| Name | Role |
| --- | --- |
| **Krina Thakkar** | Team Lead / Backend & Database Architect |
| **Divya Solanki** | Frontend & UI Developer |
| **Jaydev Patel** | Product Designer / Presenter |
| **Krisha Antala** | QA & Security Engineer |

---

## 📄 License
This project was created for the Odoo Hackathon.
