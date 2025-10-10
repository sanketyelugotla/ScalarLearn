const express = require("express");
const courseService = require("../services/course.service");
const authenticate = require("../middleware/authenticate");
const authenticateInstructor = require("../middleware/authenticateInstructor");
const upload = require("../config/multer"); // Cloudinary multer setup

const router = express.Router();

// ------------------------ Public Routes ------------------------

// Get all courses with optional search/category/pagination
router.get("/", async (req, res) => {
    try {
        const { search, category, page, limit } = req.query;
        const result = await courseService.getAllCourses({ search, category, page, limit });
        res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            ...result,
        });
    } catch (error) {
        console.error("Error getting courses:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single course
router.get("/:id", authenticate, async (req, res) => {
    try {
        const userId = req.user?._id;
        const result = await courseService.getCourse(req.params.id, userId);
        res.status(200).json({
            success: true,
            message: "Course fetched successfully",
            ...result,
        });
    } catch (error) {
        console.error("Error getting course:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ------------------------ Instructor Routes ------------------------

// Create course with optional thumbnail upload
router.post("/", authenticateInstructor, upload.single("thumbnail"), async (req, res) => {
    try {
        const instructorId = req.user._id;
        const courseData = { ...req.body, instructor: instructorId };

        if (req.file?.path) {
            console.log(req.file)
            courseData.thumbnail = req.file.path; // Cloudinary URL
        }

        const course = await courseService.createCourse(courseData);

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course,
        });
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update course with optional thumbnail upload
router.put("/:id", authenticateInstructor, upload.single("thumbnail"), async (req, res) => {
    try {
        const instructorId = req.user._id;
        const updateData = { ...req.body };

        // If a new thumbnail is uploaded, set the new URL
        if (req.file?.path) {
            updateData.thumbnail = req.file.path;
        }

        const course = await courseService.updateCourse(req.params.id, instructorId, updateData);

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course,
        });
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete course
router.delete("/:id", authenticateInstructor, async (req, res) => {
    try {
        const instructorId = req.user._id;
        const result = await courseService.deleteCourse(req.params.id, instructorId);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get instructor's courses
router.get("/instructor/my-courses", authenticateInstructor, async (req, res) => {
    try {
        const instructorId = req.user._id;
        const courses = await courseService.getInstructorCourses(instructorId);
        res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            courses,
        });
    } catch (error) {
        console.error("Error getting instructor courses:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ------------------------ Student Routes ------------------------

// Enroll in course
router.post("/:id/enroll", authenticate, async (req, res) => {
    try {
        const studentId = req.user._id;
        const result = await courseService.enrollStudent(req.params.id, studentId);
        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Error enrolling student:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get student's enrolled courses
router.get("/student/my-courses", authenticate, async (req, res) => {
    try {
        const studentId = req.user._id;
        const courses = await courseService.getStudentCourses(studentId);
        res.status(200).json({
            success: true,
            message: "Enrolled courses fetched successfully",
            courses,
        });
    } catch (error) {
        console.error("Error getting student courses:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
