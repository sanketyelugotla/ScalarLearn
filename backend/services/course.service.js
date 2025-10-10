const { Course, User, Lecture } = require("../models");
const Progress = require("../models/Progress");
const cloudinary = require("../config/cloudinary");

/**
 * Get all courses with optional filters, pagination, and search
 */
exports.getAllCourses = async ({ search, category, page = 1, limit = 10 }) => {
    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
        Course.find(query).populate("instructor", "name email").skip(skip).limit(Number(limit)),
        Course.countDocuments(query),
    ]);

    return {
        courses,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get single course by ID
 */
exports.getCourse = async (courseId, userId) => {
    const course = await Course.findById(courseId).populate("instructor", "name email");
    if (!course) throw new Error("Course not found");

    const isEnrolled = course.enrolledStudents.includes(userId);
    return { course, isEnrolled };
};

/**
 * Get course by ID without user check (used internally)
 */
exports.getCourseById = async (courseId) => {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");
    return course;
};

/**
 * Create a new course
 */
exports.createCourse = async (data) => {
    const instructor = await User.findById(data.instructor);
    if (!instructor || instructor.role !== "instructor") {
        throw new Error("Invalid instructor");
    }

    const course = new Course({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price || 0,
        thumbnail: data.thumbnail || null,
        instructor: data.instructor,
    });

    await course.save();
    return course;
};

/**
 * Update existing course (only by instructor)
 */
exports.updateCourse = async (courseId, instructorId, updateData) => {
    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) throw new Error("Course not found or unauthorized");

    Object.assign(course, updateData);
    await course.save();
    return course;
};

/**
 * Delete course (only by instructor) + delete thumbnail
 */
exports.deleteCourse = async (courseId, instructorId) => {
    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) throw new Error("Course not found or unauthorized");

    // Delete thumbnail from Cloudinary
    if (course.thumbnail && course.thumbnail.includes("res.cloudinary.com")) {
        try {
            const parts = course.thumbnail.split("/");
            const publicIdWithExt = parts.slice(-2).join("/").split(".")[0];
            await cloudinary.uploader.destroy(publicIdWithExt, { resource_type: "image" });
        } catch (err) {
            console.warn("Failed to delete course thumbnail:", err.message);
        }
    }

    await Course.findByIdAndDelete(courseId);
    return { message: "Course deleted successfully" };
};

/**
 * Get all courses by instructor
 */
exports.getInstructorCourses = async (instructorId) => {
    const courses = await Course.find({ instructor: instructorId }).populate("enrolledStudents", "name email");
    return courses;
};

/**
 * Enroll a student in a course
 */
exports.enrollStudent = async (courseId, studentId) => {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    if (course.enrolledStudents.includes(studentId)) throw new Error("Student already enrolled");

    course.enrolledStudents.push(studentId);
    await course.save();

    // Initialize Progress
    const lectures = await Lecture.find({ course: courseId }).sort({ order: 1 });
    const lecturesProgress = lectures.map((lecture) => ({
        lecture: lecture._id,
        completed: false,
        quizAttempts: [],
        bestScore: 0,
    }));

    const progress = new Progress({
        student: studentId,
        course: courseId,
        currentLecture: lectures.length > 0 ? lectures[0]._id : null,
        lecturesProgress,
        totalLectures: lectures.length,
    });

    await progress.save();
    return { message: "Enrolled successfully", course };
};

/**
 * Get all courses a student is enrolled in
 */
exports.getStudentCourses = async (studentId) => {
    const courses = await Course.find({ enrolledStudents: studentId }).populate("instructor", "name email");
    return courses;
};
