const express = require('express');
const connectDB = require('./config/db');
const cors = require("cors");
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const courseRoutes = require('./routes/course.route');
const lectureRoutes = require('./routes/lecture.route');

require("dotenv").config();

const app = express();


// CORS
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://scalar-learn.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Connect to Database
connectDB();

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Learning Platform API is running' });
});

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Port configuration and start server
const PORT = process.env.PORT || 8001;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));