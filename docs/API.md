# API Documentation

This document describes the API endpoints provided by the backend API server.

## Base URL
All requests should be sent to the backend server:
`http://localhost:5000`

---

## 🔐 Auth Modules

### Register User
* **Endpoint:** `POST /api/auth/register`
* **Description:** Register a new user account.
* **Body:**
  ```json
  {
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "strongpassword123"
  }
  ```

### Login User
* **Endpoint:** `POST /api/auth/login`
* **Description:** Authenticate user and receive JWT tokens.
* **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "strongpassword123"
  }
  ```

### Refresh Token
* **Endpoint:** `POST /api/auth/refresh`
* **Description:** Get a new access token using a refresh token.
* **Body:**
  ```json
  {
    "refresh_token": "valid_refresh_token_jwt"
  }
  ```

### Logout User
* **Endpoint:** `POST /api/auth/logout`
* **Description:** Invalidate current refresh token session.
* **Body:**
  ```json
  {
    "refresh_token": "valid_refresh_token_jwt"
  }
  ```

---

## 📁 Project Management

### Create Project
* **Endpoint:** `POST /api/projects`
* **Headers:** `Authorization: Bearer <token>`
* **Body:**
  ```json
  {
    "project_name": "E-Commerce Web App",
    "project_type": "Next.js + Tailwind",
    "category": "E-Commerce",
    "description": "An online storefront with cart and payment integration."
  }
  ```

### List Projects
* **Endpoint:** `GET /api/projects`
* **Headers:** `Authorization: Bearer <token>`

### Fetch Single Project
* **Endpoint:** `GET /api/projects/:id`
* **Headers:** `Authorization: Bearer <token>`

---

## 💬 Chat Engine

### Send Chat Message
* **Endpoint:** `POST /api/chat/message`
* **Headers:** `Authorization: Bearer <token>`
* **Body:**
  ```json
  {
    "project_id": "project-uuid-here",
    "message": "I want to add stripe payments.",
    "mentor_mode": "Professional"
  }
  ```

### Get Chat History
* **Endpoint:** `GET /api/chat/history/:project_id`
* **Headers:** `Authorization: Bearer <token>`
