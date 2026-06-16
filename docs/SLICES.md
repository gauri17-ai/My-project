# AI Website Development Mentor - Project Slices Documentation

This document outlines the full vertical slice architecture used to implement the chatbot.

---

## 1. Slice 1: Project Setup & User Auth
- **Status:** Complete
- **Goal:** Set up workspaces, database connections, JWT authentication schemas, registration, login, and token refresh.
- **Backend APIs:**
  - `POST /api/auth/register` (Name, email, password validation)
  - `POST /api/auth/login` (Authentication, returns access & refresh tokens)
  - `POST /api/auth/refresh` (Rotates JWT tokens)
  - `POST /api/auth/logout` (Revokes refresh token session)
- **Frontend Screens:**
  - Landing page (`/`)
  - Login page (`/login`)
  - Registration page (`/register`)

---

## 2. Slice 2: Project Management & Dashboard
- **Status:** Complete
- **Goal:** Implement the main project grids, dashboard layouts, and modal panels to support project CRUD.
- **Backend APIs:**
  - `POST /api/projects` (Create project)
  - `GET /api/projects` (List projects for user)
  - `GET /api/projects/:id` (Fetch single project details)
  - `PUT /api/projects/:id` (Update project metadata)
  - `DELETE /api/projects/:id` (Soft delete project)
- **Frontend Screens:**
  - Projects Dashboard (`/dashboard`)
  - Create New Project Modal component

---

## 3. Slice 3: Chat Engine & Language Handling
- **Status:** Complete
- **Goal:** Dynamic multi-turn chat system with support for English, Hindi, Marathi, Hinglish, and Maranglish. Supports fallback mock responders for offline development.
- **Backend APIs:**
  - `POST /api/chat/message` (Receives input, calls Gemini, logs interactions)
  - `GET /api/chat/history/:project_id` (Returns chronological chat history)
- **Frontend Screens:**
  - Workspace Chat View (`/dashboard/projects/[id]`)

---

## 4. Slice 4: Requirement Discovery & Progress Tracking
- **Status:** Complete
- **Goal:** Guide users through requirement gathering, automatically extract values during chat conversations, record message links, and calculate completion percentage progress.
- **Backend APIs:**
  - `GET /api/requirements/:project_id` (Lists project requirements checklist)
  - `POST /api/requirements/analyze` (Initializes requirements based on project idea)
  - `POST /api/requirements/question` (Generates next discovery question)
  - `POST /api/requirements/answer` (Saves requirement answers manually)
  - `POST /api/requirements/validate` (Checks mandatory requirement completion)
- **Frontend Screens:**
  - Workspace checklist panel within Project Summary tab

---

## 5. Slice 5: Recommendations & Docs Generation
- **Status:** Complete
- **Goal:** Generate technology selections, roadmaps, features, and exportable project documentation (PRDs).
- **Backend APIs:**
  - `GET /api/recommend/:project_id` (Retrieves saved technology & feature recommendations)
  - `POST /api/recommend/technology` (Generates tech stack selections)
  - `POST /api/recommend/features` (Generates roadmap and feature list)
  - `POST /api/docs/:document_type` (Generates PRD)
  - `GET /api/docs/:document_id/export` (Exports document in Markdown or JSON format)
  - `GET /api/docs/project/:project_id` (Lists all generated documents for project)
- **Frontend Screens:**
  - Tech Stack Recommendation Tab
  - Roadmap Phase Timeline Tab
  - Document Preview & Export Tab

---

## 6. Slice 6: Admin Dashboard & Knowledge Base
- **Status:** Complete
- **Goal:** Administrator control room for managing users, monitoring usage analytics, and organizing knowledge base articles.
- **Backend APIs:**
  - `GET /api/admin/users` (Lists all users)
  - `POST /api/admin/users/:id/suspend` (Suspends a user account)
  - `POST /api/admin/users/:id/activate` (Activates a suspended user)
  - `POST /api/admin/users/:id/role` (Changes user role)
  - `GET /api/admin/analytics` (Returns system metrics & latency stats)
  - `GET /api/admin/kb` (Retrieves knowledge base articles)
  - `POST /api/admin/kb` (Creates knowledge base article)
  - `PUT /api/admin/kb/:id` (Updates article details)
  - `DELETE /api/admin/kb/:id` (Deletes knowledge article)
- **Frontend Screens:**
  - Admin Directory Console (`/admin`)

---

## 7. Slice 7: User Profile & Settings
- **Status:** Complete
- **Goal:** Settings interface allowing users to modify personal info, preferred language, and change passwords.
- **Backend APIs:**
  - `GET /api/auth/profile` (Fetch profile details)
  - `PUT /api/auth/profile` (Update full name & preferences)
  - `PUT /api/auth/profile/password` (Update current password)
- **Frontend Screens:**
  - User Settings & Account Screen (`/dashboard/settings`)

---

## 8. Slice 8: Forgot Password & Reset Password Flow
- **Status:** Complete
- **Goal:** Password recovery flow generating secure hashed tokens, enforcing password complexity validation, and preventing account enumeration.
- **Backend APIs:**
  - `POST /api/auth/forgot-password` (Generates token, logs mock email link)
  - `POST /api/auth/reset-password` (Verifies token, updates password, revokes token)
- **Frontend Screens:**
  - Request Password Reset (`/forgot-password`)
  - Reset Password Credentials (`/reset-password`)

---

## 9. Slice 9: PDF & DOCX Document Export
- **Status:** Complete
- **Goal:** Enable users to export generated documents (PRDs, Roadmaps, Use Cases, User Stories, and SRS) in styled PDF and Microsoft Word (.docx) formats.
- **Backend APIs:**
  - `GET /api/docs/:document_id/export?format=pdf` (Generates and downloads PDF file)
  - `GET /api/docs/:document_id/export?format=docx` (Generates and downloads Word file)
- **Frontend Screens:**
  - Project Workspace Documentation Tab (`/dashboard/projects/[id]`) with download options.

