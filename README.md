# ScalarLearn: Online Learning Platform

## Project Overview
ScalarLearn is a full-stack online learning platform designed for engineering students and professionals. It provides structured courses, interactive quizzes, reading materials, progress tracking, and community-driven features. The platform supports both students and instructors, enabling course creation, enrollment, and resource sharing.

---

## Live Demo
Access the live platform here: [https://scalar-learn.vercel.app](https://scalar-learn.vercel.app)

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
You must copy and paste the following environment variables into your respective `.env` files for the project to work locally:

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_DATABASE_URI=http://localhost:5000/api
```

#### Backend (`backend/.env`)
```env
MONGO_URI = "mongodb+srv://sanketyelugotla:sanket@speakx.abkna.mongodb.net/learning_platform?retryWrites=true&w=majority&appName=speakx"
JWT_SECRET = "8abcc049fa12a8d797b7dea5326990d8039dd663de874a031ec48dd87759be61"
PORT = "5000"
CLOUDINARY_API_KEY = "257146944171826"
CLOUDINARY_SECRET_KEY = "gHRDYIKhxR9c16L9Q-6u_eTwvUM"
CLOUDINARY_NAME = "dbkoifpdg"
```

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

---

## Screenshots
Below are some screenshots of the ScalarLearn platform UI. You can also view these images in the [Screenshots folder](Screenshots/) or directly in the GitHub repo.


### Mobile View (iPhone 13 Pro)
<img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/iPhone-13-PRO-localhost%20(1).png?raw=true" width="300" />
<img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/iPhone-13-PRO-localhost%20(2).png?raw=true" width="300" />
<img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/iPhone-13-PRO-localhost%20(3).png?raw=true" width="300" />
<img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/iPhone-13-PRO-localhost%20(4).png?raw=true" width="300" />
<img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/iPhone-13-PRO-localhost%20(5).png?raw=true" width="300" />
<img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/iPhone-13-PRO-localhost%20(6).png?raw=true" width="300" />
<img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/iPhone-13-PRO-localhost.png?raw=true" width="300" />


### Desktop View (Macbook Air)
<table>
  <tr>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(1).png?raw=true" width="400" /></td>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(2).png?raw=true" width="400" /></td>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(3).png?raw=true" width="400" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(4).png?raw=true" width="400" /></td>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(5).png?raw=true" width="400" /></td>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(6).png?raw=true" width="400" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(7).png?raw=true" width="400" /></td>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(8).png?raw=true" width="400" /></td>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(9).png?raw=true" width="400" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(10).png?raw=true" width="400" /></td>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(11).png?raw=true" width="400" /></td>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(12).png?raw=true" width="400" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost%20(13).png?raw=true" width="400" /></td>
    <td><img src="https://github.com/sanketyelugotla/ScalarLearn/blob/main/Screenshots/Macbook-Air-localhost.png?raw=true" width="400" /></td>
    <td></td>
  </tr>
</table>
