const express = require("express");
const authenticate = require("../middleware/authenticate");
const User = require("../models/User");
const Progress = require("../models/Progress");

const router = express.Router();

// Get user profile
router.get("/profile", authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)
            .select('-password')
            .populate({
                path: 'enrolledCourses',
                populate: {
                    path: 'instructor',
                    select: 'name email'
                }
            })
            .populate('coursesCreated');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Get progress for enrolled courses (if student)
        let coursesWithProgress = [];
        if (user.role === 'student' && user.enrolledCourses.length > 0) {
            coursesWithProgress = await Promise.all(
                user.enrolledCourses.map(async (course) => {
                    const progress = await Progress.findOne({
                        student: userId,
                        course: course._id
                    });

                    return {
                        ...course.toObject(),
                        progress: progress ? {
                            completedLectures: progress.completedLectures,
                            totalLectures: progress.totalLectures,
                            progressPercentage: progress.progressPercentage
                        } : null
                    };
                })
            );
        }

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user: {
                ...user.toObject(),
                enrolledCourses: coursesWithProgress.length > 0 ? coursesWithProgress : user.enrolledCourses
            }
        });
    } catch (error) {
        console.error("Error getting user profile:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user profile
router.put("/profile", authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, bio, avatar } = req.body;

        // Don't allow updating sensitive fields
        const updateData = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar) updateData.avatar = avatar;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user dashboard data
router.get("/dashboard", authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let dashboardData = {
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                avatar: user.avatar
            }
        };

        if (user.role === 'student') {
            const progressRecords = await Progress.find({ student: userId })
                .populate('course', 'title thumbnail category')
                .populate('currentLecture', 'title type')
                .sort({ updatedAt: -1 });

            dashboardData.enrolledCoursesCount = user.enrolledCourses.length;
            dashboardData.completedCoursesCount = user.completedCourses.length;
            dashboardData.inProgressCourses = progressRecords.filter(p => p.progressPercentage < 100);
            dashboardData.completedCourses = progressRecords.filter(p => p.progressPercentage === 100);
        } else if (user.role === 'instructor') {
            const Course = require("../models/Course");
            const courses = await Course.find({ instructor: userId })
                .populate('lectures', 'title type');

            dashboardData.coursesCreatedCount = courses.length;
            dashboardData.totalStudentsEnrolled = courses.reduce(
                (sum, course) => sum + course.enrolledStudents.length,
                0
            );
            dashboardData.courses = courses;
        }

        res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            dashboard: dashboardData
        });
    } catch (error) {
        console.error("Error getting dashboard data:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;