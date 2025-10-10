const express = require("express");
const lectureService = require("../services/lecture.service");
const authenticate = require("../middleware/authenticate");
const authenticateInstructor = require("../middleware/authenticateInstructor");
const upload = require("../config/multer.js");

const router = express.Router();

/**
 * 📘 Create a new lecture (Instructor only)
 * POST /api/lectures/:courseId
 */

router.post("/:courseId", authenticateInstructor, upload.single("file"), async (req, res) => {
    try {
        const instructorId = req.user._id;
        const courseId = req.params.courseId;
        const lectureData = req.body;

        // ✅ If a file was uploaded, store Cloudinary URL
        if (req.file && req.file.path) {
            lectureData.fileUrl = req.file.path; // Cloudinary URL
            lectureData.fileName = req.file.originalname;
        }

        const lecture = await lectureService.createLecture(courseId, instructorId, lectureData);

        res.status(201).json({
            success: true,
            message: "Lecture created successfully",
            lecture,
        });
    } catch (error) {
        console.error("Error creating lecture:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 📗 Get lecture by ID
 * GET /api/lectures/:id
 */
router.get("/:id", authenticate, async (req, res) => {
    try {
        const lectureId = req.params.id;
        const userId = req.user._id;
        const userRole = req.user.role;

        const lecture = await lectureService.getLecture(lectureId, userId, userRole);

        res.status(200).json({
            success: true,
            message: "Lecture fetched successfully",
            lecture,
        });
    } catch (error) {
        console.error("Error getting lecture:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 📙 Update lecture (Instructor only)
 * PUT /api/lectures/:id
 */
router.put("/:id", authenticateInstructor, upload.single("file"), async (req, res) => {
    try {
        const lectureId = req.params.id;
        const instructorId = req.user._id;
        const updateData = req.body;

        // ✅ If a new file is uploaded, use Cloudinary URL
        if (req.file && req.file.path) {
            updateData.fileUrl = req.file.path; // Cloudinary public URL
            updateData.fileName = req.file.originalname;
        }

        const lecture = await lectureService.updateLecture(lectureId, instructorId, updateData);

        res.status(200).json({
            success: true,
            message: "Lecture updated successfully",
            lecture,
        });
    } catch (error) {
        console.error("Error updating lecture:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 📕 Delete lecture (Instructor only)
 * DELETE /api/lectures/:id
 */
router.delete("/:id", authenticateInstructor, async (req, res) => {
    try {
        const lectureId = req.params.id;
        const instructorId = req.user._id;

        const result = await lectureService.deleteLecture(lectureId, instructorId);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error("Error deleting lecture:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 📒 Complete a reading lecture (Students only)
 * POST /api/lectures/:id/complete
 */
router.post("/:id/complete", authenticate, async (req, res) => {
    try {
        const lectureId = req.params.id;
        const studentId = req.user._id;

        const result = await lectureService.completeReading(lectureId, studentId);

        res.status(200).json({
            success: true,
            message: result.message,
            progress: result.progress,
        });
    } catch (error) {
        console.error("Error completing lecture:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 🧩 Submit a quiz (Students only)
 * POST /api/lectures/:id/quiz
 */
router.post("/:id/quiz", authenticate, async (req, res) => {
    try {
        const lectureId = req.params.id;
        const studentId = req.user._id;
        const { answers } = req.body;

        const result = await lectureService.submitQuiz(lectureId, studentId, answers);

        res.status(200).json({
            success: true,
            message: result.message,
            ...result,
        });
    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 📂 Get all course lectures (For navigation)
 * GET /api/lectures/course/:courseId
 */
router.get("/course/:courseId", authenticate, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user._id;
        const userRole = req.user.role;

        const lectures = await lectureService.getCourseLectures(courseId, userId, userRole);

        res.status(200).json({
            success: true,
            message: "Course lectures fetched successfully",
            lectures,
        });
    } catch (error) {
        console.error("Error getting course lectures:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
