# AI Website Development Mentor Chatbot

An AI-powered conversational mentor assistant designed to guide users from initial website ideas through detailed requirements gathering, feature roadmap planning, technology stack selection, and structured document exports.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Vanilla CSS (harmonious dark styling)
- **Backend**: Node.js, Express, Prisma ORM, TypeScript
- **Database**: SQLite (local development)
- **AI**: Gemini 2.5 Flash via OpenRouter API / Gemini API

---

## 📂 Project Architecture

Please refer to the documentation files in the `docs/` folder:
- [📂 File Architecture & Deployment Guide](docs/DEPLOYMENT.md)
- [📝 Product Requirements Document (PRD)](docs/PRD.md)
- [🔗 Backend API Specification](docs/API.md)
- [🗄️ Database Models & Schema](docs/DATABASE.md)
- [⚙️ Vertical Slices Documentation](docs/SLICES.md)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+)
- npm

### Setup & Startup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
2. **Start Dev Servers (Frontend + Backend concurrently):**
   ```bash
   npm run dev
   ```
   - Frontend runs at: `http://localhost:3000`
   - Backend API runs at: `http://localhost:5000`
