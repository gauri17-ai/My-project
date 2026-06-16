# Database Architecture & Models

This document outlines the SQLite schema used in the database.

## Database File
- **Local Dev Database**: `backend/prisma/dev.db`
- **ORM**: Prisma Client

---

## 📊 Models Summary

### 1. User
Represents registered users in the system.
* **Fields:**
  - `id` (UUID, Primary Key)
  - `fullName` (String, mapped to `full_name`)
  - `email` (String, Unique)
  - `passwordHash` (String, mapped to `password_hash`)
  - `role` (String, default: "user")
  - `preferredLanguage` (String)
  - `status` (String, default: "active")
  - `createdAt` / `updatedAt`

### 2. Project
Holds project information planned by the user.
* **Fields:**
  - `id` (UUID, Primary Key)
  - `userId` (Foreign Key -> User)
  - `projectName` (String)
  - `projectType` (String)
  - `description` (String)
  - `requirementCompletionPercentage` (Int)
  - `createdAt` / `updatedAt`

### 3. Conversation
Chronological message history between the User and AI Mentor.
* **Fields:**
  - `id` (UUID)
  - `userId` (FK -> User)
  - `projectId` (FK -> Project)
  - `senderType` (String: `user` / `ai` / `system`)
  - `message` (String)
  - `createdAt`

### 4. KnowledgeBaseArticle
Mentoring guidelines and resources managed by Admins.
* **Fields:**
  - `id` (UUID)
  - `title` (String)
  - `category` (String)
  - `content` (String)
  - `status` (String: `draft` / `published`)
  - `createdBy` (FK -> User)
  - `createdAt` / `updatedAt`
