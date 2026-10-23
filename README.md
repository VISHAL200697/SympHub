# Symposium Management / Workshop Registration System (MERN Stack)

A full-stack MERN application (MongoDB, Express, React, Node.js) for college departments & clubs to publish symposiums, workshops, seminars, and hackathons with single-click RSVP.

---

## 🚀 Tech Stack (MERN Architecture)

- **Database**: MongoDB (Mongoose 8+)
- **Backend API**: Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs, CORS, dotenv.
- **Frontend App**: React 18, Vite, TailwindCSS v4, React Router 6, Axios, Lucide React Icons.

---

## 🛠️ Project Structure & Domain Architecture

Strict domain file separation maintained across both backend and frontend layers:

```
/backend
  server.js            (Main Express app entry point)
  seed.js              (MongoDB database seeding script)
  package.json
  .env
  /config
    db.js              (MongoDB connection module)
  /middleware
    auth.js            (JWT verify token & role guards: protect, requireRole)
  /models
    user.js            (User Mongoose schema & bcrypt matchPassword)
    department.js      (Department Mongoose schema)
    category.js        (Category Mongoose schema)
    event.js           (Event Mongoose schema)
    registration.js    (Registration Mongoose schema & compound unique index)
  /controllers
    auth.js            (signup, login, getMe)
    events.js          (getEvents, getEventById, createEvent, updateEvent, deleteEvent, getDepartments, getCategories)
    registrations.js   (registerForEvent with atomic seat decrement, cancelRegistration, getMyRegistrations, getEventAttendees, exportEventAttendees CSV/JSON)
    admin.js           (getUsers, updateUser, getAdminOverview, department & category CRUD)
  /routes
    auth.js            (/auth/signup, /auth/login, /auth/me)
    events.js          (/events, /events/:id, /departments, /categories)
    registrations.js   (/events/:id/register, /me/registrations, /events/:id/attendees, /events/:id/export)
    admin.js           (/admin/users, /admin/overview, /admin/departments, /admin/categories)

/frontend
  /src
    /api
      client.js        (Axios client with Bearer token interceptor)
      authApi.js       (Auth service endpoints)
      eventsApi.js     (Events & metadata service endpoints)
      registrationsApi.js (RSVP & attendee export service endpoints)
      adminApi.js      (Admin service endpoints)
    /context
      AuthContext.jsx  (Global user state & JWT authentication provider)
    /pages
      /auth (Login.jsx, Signup.jsx)
      /events (EventListing.jsx, EventDetail.jsx)
      /registrations (MyRegistrations.jsx)
      /organizer (MyEvents.jsx, EventForm.jsx, EventRegistrations.jsx)
      /admin (Overview.jsx, UserManagement.jsx, DepartmentsCategories.jsx)
    /components (Navbar.jsx, ProtectedRoute.jsx, EventCard.jsx)
  package.json
  vite.config.js
```

---

## 🔐 Default Seed Logins

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@symposium.edu` | `AdminPass123!` |
| **Organizer (CS)** | `organizer.cs@symposium.edu` | `OrgPass123!` |
| **Organizer (ECE)** | `organizer.ece@symposium.edu` | `OrgPass123!` |
| **Student** | `student1@symposium.edu` | `StudentPass123!` |
| **Student** | `student2@symposium.edu` | `StudentPass123!` |
| **Student** | `student5@symposium.edu` | `StudentPass123!` |

---

## 🏃 How to Run the MERN Stack Project

### 1. MongoDB Backend (Node.js + Express)

```bash
cd backend

# Install dependencies
npm install

# Run database seed script (Seeds MongoDB with realistic sample events, departments, users)
npm run seed

# Start MERN backend server
npm run dev
```

- **Backend API Base URL**: `http://localhost:8000`

### 2. Frontend Application (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

- **Frontend Application URL**: `http://localhost:5173`
