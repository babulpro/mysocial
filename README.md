# 🚀 SocialHub REST API Backend

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.3-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.11-red?style=for-the-badge&logo=mongodb)](https://mongoosejs.com/)
[![Vercel Serverless](https://img.shields.io/badge/Vercel-Serverless-black?style=for-the-badge&logo=vercel)](https://mysocial-omega.vercel.app)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

> High-performance RESTful API microservice powering the **SocialHub** community events platform. Built with Express 5, MongoDB Atlas, Mongoose, and deployed as a serverless service on Vercel.

---

## 🔗 Live Service URLs

- **API Base URL:** [https://mysocial-omega.vercel.app](https://mysocial-omega.vercel.app)
- **Health Check Endpoint:** [https://mysocial-omega.vercel.app/health](https://mysocial-omega.vercel.app/health)
- **Frontend App:** [https://socialwork-kappa.vercel.app](https://socialwork-kappa.vercel.app)
- **GitHub Repository:** [https://github.com/babulpro/mysocial](https://github.com/babulpro/mysocial)

---

## 📦 Welcome Endpoint (`GET /`)

A `GET` request to the root URL returns the welcome status and documentation map:

```bash
curl -X GET https://mysocial-omega.vercel.app/
```

### JSON Response:
```json
{
  "status": "welcome",
  "message": "Welcome to SocialHub Backend API 🚀",
  "version": "1.0.0",
  "documentation": {
    "health": "/health",
    "auth": {
      "register": "POST /api/auth/register",
      "login": "POST /api/auth/login",
      "me": "GET /api/auth/me"
    },
    "events": {
      "list": "GET /api/events",
      "create": "POST /api/events",
      "single": "GET /api/events/:id",
      "join": "POST /api/events/:id/join",
      "myEvents": "GET /api/events/user/my-events"
    }
  }
}
```

---

## 🩺 Health Check (`GET /health`)

Checks server status and database connectivity in real time:

```bash
curl -X GET https://mysocial-omega.vercel.app/health
```

### Response:
```json
{
  "status": "OK",
  "message": "Social Management Server is running 🚀",
  "database": "connected",
  "timestamp": "2026-11-05T14:50:00.000Z"
}
```

---

## 📚 API Endpoints Reference

### 1. Events Endpoints (`/api/events`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| **GET** | `/api/events` | No | Fetch events with search (`?search=`), category filter (`?category=`), and sorting (`?sort=-date`) |
| **GET** | `/api/events/:id` | No | Get event details by MongoDB ObjectId |
| **POST** | `/api/events` | **Yes** | Create a new community event |
| **DELETE** | `/api/events/:id` | **Yes** | Delete event (Organizer only) |
| **POST** | `/api/events/:id/join` | **Yes** | Toggle RSVP (Join / Leave event) |
| **GET** | `/api/events/user/my-events` | **Yes** | Retrieve all events created by the logged-in user |

#### Example: Create Event (`POST /api/events`)
```http
POST /api/events
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Next.js & AI Developers Summit 2026",
  "description": "Explore full-stack AI development, agents, and modern cloud deployment.",
  "category": "tech",
  "date": "2026-11-15T18:00:00.000Z",
  "time": "18:00",
  "location": "Dhaka Tech Hub, Hall 4B",
  "coverImage": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "maxAttendees": 100
}
```

#### Example: Join / Leave Event (`POST /api/events/:id/join`)
```http
POST /api/events/672a1b9e289f6483182abcde/join
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "action": "joined",
  "message": "Successfully joined the event",
  "attendeeCount": 42,
  "isAttending": true
}
```

---

### 2. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user with name, email, and password |
| **POST** | `/api/auth/login` | Sign in with email and password, returns JWT token |
| **GET** | `/api/auth/me` | Retrieve authenticated user profile |

---

## 🏗️ Architecture & Folder Structure

```
social-server/
├── api/
│   └── index.js             # Vercel serverless entry point
├── src/
│   ├── config/
│   │   └── db.js            # Cached MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── auth.controller.js  # Registration, login, profile logic
│   │   └── event.controller.js # CRUD, attendee join/leave, occupancy logic
│   ├── middlewares/
│   │   ├── auth.middleware.js  # JWT token validation & user injection
│   │   └── error.middleware.js # Global error handler
│   ├── models/
│   │   ├── Event.model.js   # Event schema with attendees, maxAttendees, category
│   │   └── User.model.js    # User schema with bcrypt password hashing
│   ├── routes/
│   │   ├── auth.routes.js   # Auth Express router
│   │   └── event.routes.js  # Events Express router
│   └── app.js               # Express application configuration & root route
├── .env.example             # Template for environment variables
├── package.json
├── server.js                # Local server runner (`npm run dev`)
└── vercel.json              # Vercel serverless routing configuration
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js:** v18+ installed
- **MongoDB Atlas Connection URI**

### 2. Installation
```bash
git clone https://github.com/babulpro/mysocial.git
cd mysocial
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/socialwork?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_at_least_32_chars_long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### 4. Run Server
```bash
# Start with auto-reload (nodemon)
npm run dev

# Or start in standard mode
npm start
```

Server will boot on `http://localhost:5000`.

---

## ☁️ Vercel Serverless Deployment

The project uses `api/index.js` as the serverless function target and `vercel.json` rewrites:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

### Database Connection Caching:
`src/config/db.js` caches the Mongoose connection globally across serverless lambda invocations to prevent exhausting MongoDB Atlas connection limits.

---

## 🔒 Security Features

- **Helmet:** Sets security-oriented HTTP response headers.
- **CORS Support:** Configured for credentialed cross-origin requests from both localhost and production Vercel frontends.
- **Rate Limiting & Sanitization:** Payload limit set to 10MB; inputs validated via Express Validator.
- **Password Hashing:** Passwords hashed with `bcryptjs` salt rounds before database persistence.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

*SocialHub Backend • Developed for Scalable Community Events Management.*
