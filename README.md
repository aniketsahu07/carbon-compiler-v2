<div align="center">

# 🌿 Carbon Compiler V2

### A World-Class Carbon Credit Registry & Marketplace Platform

**Trade · Validate · Offset · Verify**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-carboncompilerv2.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://carboncompilerv2.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [User Roles](#-user-roles)
- [AI Capabilities](#-ai-capabilities)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌍 Overview

**Carbon Compiler V2** is a full-stack, production-grade **Carbon Credit Registry and Marketplace** built for the modern climate economy. It enables developers to register carbon offset projects, buyers to purchase verified credits, and admins to govern the entire ecosystem — all backed by a real-time, tamper-evident public ledger.

The platform combines **blockchain-inspired transparency**, **AI-powered validation**, and **satellite imagery analysis** to bring trust and efficiency to voluntary carbon markets.

> Built for climate-tech startups, ESG-driven enterprises, and sustainability-focused developers.

---

## 🚀 Live Demo

| Environment | URL |
|---|---|
| 🟢 **Production** | [https://carboncompilerv2.vercel.app](https://carboncompilerv2.vercel.app) |
| 🔵 **GitHub Repo** | [github.com/aniketsahu07/carbon-compiler-v2](https://github.com/aniketsahu07/carbon-compiler-v2) |

---

## ✨ Key Features

### 🛒 Marketplace
- Browse verified carbon offset projects with live Firestore data
- Search, filter by country, type, and price range
- Compare up to 3 credits side-by-side
- Add to cart with a smooth drawer experience
- Floating compare bar for quick credit analysis

### 📒 Public Ledger
- Real-time, immutable audit trail of all credit transactions
- Search & filter by action type (Mint, Transfer, Retire, Burn)
- Sortable columns (date, amount, action)
- Configurable pagination (10 / 25 / 50 rows)
- One-click hash copy for blockchain-style verification
- Auto-refreshes every 15 seconds silently

### 🤖 AI Assistant
- Conversational AI powered by HuggingFace & Google Gemini
- Answers questions about carbon markets, NDC frameworks, and sustainability
- Context-aware responses using Genkit AI orchestration

### 🛰️ Satellite Imagery Analysis
- Upload or link satellite imagery of project sites
- AI analyzes vegetation density, land-use change, and carbon sequestration potential
- Powered by HuggingFace multimodal models via Leaflet map integration

### 🧮 Carbon Calculator
- Estimate your carbon footprint across Scope 1, 2, and 3 emissions
- Dynamic offset recommendations based on project types

### 📋 NDC Framework
- Explore Nationally Determined Contributions from global climate agreements
- Interactive modal detail view per country commitment

---

## 👥 User Roles

### 🟢 Buyer
- Purchase verified carbon credits from the marketplace
- Manage portfolio with claim and retire actions
- View purchase history and downloadable receipts
- Analytics dashboard with PieChart breakdown by credit type

### 🔵 Developer (Project Owner)
- Register new carbon offset projects with supporting documentation
- Track project approval status in real-time
- Edit project details and upload satellite imagery
- Dashboard with project stats and earnings overview

### 🔴 Admin
- Review and approve / reject developer-submitted projects
- Mint carbon credits upon project approval
- Manage the full credit registry (view, burn, transfer)
- Monitor compliance alerts and system health
- AI-powered batch validation of project submissions

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 with App Router + Turbopack |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 + CSS Custom Properties |
| **UI Components** | shadcn/ui + Radix UI |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Maps** | React Leaflet |
| **Auth & Database** | Firebase 11 (Auth + Firestore + Storage) |
| **AI Orchestration** | Genkit 1.20 |
| **AI Models** | Google Gemini 2.0 Flash · HuggingFace · Grok (xAI) |
| **Forms** | React Hook Form + Zod |
| **Animations** | Tailwind CSS keyframes + CSS animations |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
carbon-compiler-v2/
├── src/
│   ├── ai/                          # AI flows & Genkit configuration
│   │   ├── genkit.ts                # Google Gemini setup
│   │   ├── grok.ts                  # xAI Grok integration
│   │   ├── mediator.ts              # AI mediator logic
│   │   └── flows/
│   │       ├── ai-assistant.ts      # Conversational AI
│   │       ├── analyze-satellite-image.ts
│   │       ├── get-carbon-offset-project-suggestions.ts
│   │       └── validate-carbon-offset-projects.ts
│   │
│   ├── app/                         # Next.js App Router pages
│   │   ├── page.tsx                 # Landing / Home page
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css              # Design system tokens + animations
│   │   ├── admin/                   # Admin portal (dashboard, projects, credits, review, ai-validation)
│   │   ├── buyer/                   # Buyer portal (dashboard, history)
│   │   ├── developer/               # Developer portal (dashboard, projects, register, edit)
│   │   ├── marketplace/             # Credit marketplace
│   │   ├── ledger/                  # Public audit ledger
│   │   ├── calculator/              # Carbon footprint calculator
│   │   ├── ndc/                     # NDC framework explorer
│   │   ├── ai-assistant/            # AI chat interface
│   │   ├── satellite-imagery/       # Satellite analysis tool
│   │   ├── checkout/                # Payment + checkout
│   │   ├── profile/                 # User profile settings
│   │   ├── login/ & signup/         # Authentication
│   │   └── api/ledger/              # Ledger REST API
│   │
│   ├── components/
│   │   ├── layout/app-shell.tsx     # Sidebar + header layout
│   │   ├── ui/                      # shadcn/ui component library
│   │   ├── AddToCartDialog.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CompareCreditsDialog.tsx
│   │   ├── ProjectDetailsModal.tsx
│   │   ├── SatelliteMap.tsx
│   │   └── NotificationBell.tsx
│   │
│   ├── firebase/                    # Firebase client setup
│   │   ├── config.ts                # Firebase project config
│   │   ├── provider.tsx             # Auth context provider
│   │   └── firestore/               # Firestore hooks
│   │
│   ├── context/CartContext.tsx      # Shopping cart state
│   ├── hooks/                       # Custom React hooks
│   └── lib/                         # Types, utils, config, payment
│
├── public/images/                   # Static assets
├── docs/                            # API & architecture docs
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind theme
├── tsconfig.json                    # TypeScript config
├── firestore.rules                  # Firestore security rules
└── apphosting.yaml                  # Firebase App Hosting config
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** `>= 18.0.0`
- **npm** `>= 9.0.0`
- A **Firebase** project (Firestore + Authentication enabled)

### 1. Clone the Repository

```bash
git clone https://github.com/aniketsahu07/carbon-compiler-v2.git
cd carbon-compiler-v2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add your keys (see below).

### 4. Run Development Server

```bash
npm run dev
```

Opens at **http://localhost:9002** with Turbopack enabled.

### 5. (Optional) Run Genkit AI Dev UI

```bash
npm run genkit:dev
```

---

## 🔐 Environment Variables

Create `.env.local` in the project root:

```env
# Google Gemini / Genkit
GOOGLE_GENAI_API_KEY=your_google_generative_ai_key

# HuggingFace (AI Flows)
HUGGINGFACE_API_KEY=your_huggingface_token

# xAI Grok
XAI_API_KEY=your_xai_api_key

# AI Model Overrides (optional)
MAIN_MODEL=Qwen/Qwen2.5-7B-Instruct
MEDIATOR_MODEL=googleai/gemini-2.0-flash-lite

# Payment Gateway
JUSPAY_API_KEY=your_juspay_key
```

---

## 🤖 AI Capabilities

| Feature | Model / Provider | Route |
|---|---|---|
| AI Assistant Chat | HuggingFace Qwen2.5-7B | `/ai-assistant` |
| Satellite Image Analysis | HuggingFace multimodal | `/satellite-imagery` |
| Project Suggestion Generator | HuggingFace Qwen2.5-7B | Developer dashboard |
| Batch Project Validation | HuggingFace Qwen2.5-7B | Admin AI Validation |
| AI Orchestration Layer | Google Genkit + Gemini 2.0 | All server actions |

---

## 📦 Available Scripts

```bash
npm run dev           # Start dev server (Turbopack, port 9002)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint check
npm run typecheck     # TypeScript type checking
npm run genkit:dev    # Start Genkit AI development UI
npm run genkit:watch  # Watch mode for Genkit flows
```

---

## ☁️ Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Set Environment Variables on Vercel

```bash
vercel env add GOOGLE_GENAI_API_KEY
vercel env add HUGGINGFACE_API_KEY
vercel env add XAI_API_KEY
vercel env add JUSPAY_API_KEY
```

### Deploy to Firebase App Hosting

```bash
firebase deploy
```

---

## 🗂️ Firestore Data Model

```
firestore/
├── users/{userId}           # User profiles + roles (ADMIN | BUYER | DEVELOPER)
├── projects/{projectId}     # Carbon offset project submissions
├── credits/{creditId}       # Minted carbon credits
├── transactions/{txId}      # Ledger entries (mint / transfer / retire / burn)
├── portfolios/{userId}      # Buyer credit holdings
└── notifications/{userId}   # Real-time user notifications
```

---

## 🔒 Security

- **Firestore Security Rules** — role-based read/write in `firestore.rules`
- **Firebase Auth** — email/password with session persistence
- **RBAC** — `ADMIN`, `BUYER`, `DEVELOPER` roles enforced client-side + Firestore rules
- **Server External Packages** — AI/Firebase Admin packages run server-side only, never bundled to client

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

### Commit Convention

| Prefix | Usage |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Maintenance |
| `refactor:` | Code restructure |
| `docs:` | Documentation |
| `style:` | UI / styling |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Aniket Sahu** · [@aniketsahu07](https://github.com/aniketsahu07)

---

<div align="center">

Made with 🌿 for a sustainable planet

**[⭐ Star this repo](https://github.com/aniketsahu07/carbon-compiler-v2)** if you find it useful!

</div>
