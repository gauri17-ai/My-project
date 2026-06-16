# Fullstack Deployment Guide & File Architecture

This repository is organized as a monorepo featuring an Express + Prisma backend and a Next.js frontend.

---

## 📂 File Architecture

```
ai-dev-mentor-chatbot/
├── backend/                  # Express API Server
│   ├── prisma/               # Prisma schema & SQLite dev database
│   ├── src/                  # Express source code (controllers, routes, etc.)
│   ├── Dockerfile            # Backend Docker instructions
│   ├── package.json          # Backend package configurations
│   └── tsconfig.json         # TypeScript configurations
├── frontend/                 # Next.js Frontend Web Client
│   ├── src/                  # Next.js Pages & React components
│   ├── Dockerfile            # Frontend Docker instructions
│   └── package.json          # Frontend package configurations
├── docker-compose.yml        # Orchestrates running backend & frontend containers
├── package.json              # Root package.json to coordinate root scripts
└── DEPLOYMENT.md             # This deployment guide
```

---

## 🚀 Deployment Instructions

### Option 1: Docker Compose (Recommended for Local Prod & VM Deployments)

To run the entire fullstack application in a production-ready containerized environment:

1. Make sure you have Docker installed.
2. Run the following command from the root directory:
   ```bash
   docker compose up --build
   ```
3. The application will be accessible at:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

---

### Option 2: Monorepo Root Scripts (Local Node.js Environment)

We have added a root-level `package.json` to manage development and installation seamlessly:

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
2. **Start development servers simultaneously:**
   ```bash
   npm run dev
   ```
3. **Build both applications:**
   ```bash
   npm run build:all
   ```

---

### Option 3: Deploying to Cloud Services (Render, Vercel, Railway, etc.)

#### Backend API (e.g., Render / Railway / AWS ECS)
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build && npx prisma db push`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT=5000`
  - `DATABASE_URL` (Set up a PostgreSQL or MySQL database in production and update the Prisma schema/env)
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `GEMINI_API_KEY`

#### Frontend (e.g., Vercel / Netlify / Render)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start` (if running server-side)
- **Environment Variables**:
  - `NEXT_PUBLIC_BACKEND_URL`: Set to the deployed backend URL (e.g., `https://your-backend-api.onrender.com`)
