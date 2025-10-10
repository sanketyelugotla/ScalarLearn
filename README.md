# ScalarLearn: Online Learning Platform

## Project Overview
ScalarLearn is a full-stack online learning platform designed for engineering students and professionals. It provides structured courses, interactive quizzes, reading materials, progress tracking, and community-driven features. The platform supports both students and instructors, enabling course creation, enrollment, and resource sharing.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Frontend](#frontend)
- [Backend](#backend)
- [Setup & Installation](#setup--installation)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- Structured courses with reading materials and quizzes
- Progress tracking for students
- Instructor dashboard for course management
- Student enrollment and course access
- Resource saving and statistics
- Community collaboration and projects
- Authentication and role-based access
- File uploads (course thumbnails, resources)

---

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion, Radix UI, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary, Multer

---

## Frontend
- Built with Next.js and React for fast, modern UI
- Uses Tailwind CSS for styling and Framer Motion for animations
- Features include:
  - Course browsing and enrollment
  - Progress tracking
  - Quizzes and reading materials
  - Instructor and student dashboards
  - Community resources and blogs
- Main entry: `frontend/app/page.jsx`
- Context management via `frontend/context/userContext.jsx`
- UI components in `frontend/components/`

---

## Backend
- RESTful API built with Express.js
- MongoDB for data storage (Mongoose models)
- Authentication using JWT
- Role-based access for students and instructors
- File uploads via Multer and Cloudinary
- Key models: `User`, `Course`, `Lecture`, `Progress`, `Download`
- Main entry: `backend/index.js`
- API routes in `backend/routes/`
- Services for business logic in `backend/services/`

### Example API Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (instructor only)
- `POST /api/courses/:id/enroll` - Enroll in course (student only)

---

## Setup & Installation

### Prerequisites
- Node.js & npm
- MongoDB (local or cloud)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
- Backend: Create a `.env` file in `backend/` for DB connection, JWT secret, Cloudinary keys, etc.
- Frontend: Create a `.env.local` file in `frontend/` for API URLs if needed.

---

## Folder Structure
```
backend/
  config/         # DB, Cloudinary, Multer configs
  middleware/     # Auth & upload middleware
  models/         # Mongoose models
  routes/         # API route handlers
  services/       # Business logic
  uploads/        # Uploaded files
frontend/
  app/            # Next.js app pages
  components/     # UI components
  context/        # React context
  lib/            # Utilities
  public/         # Static assets
  services/       # API calls
  styles/         # CSS
```

---

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

---

## License
This project is licensed under the ISC License.
