const Lecture = require("../models/Lecture");
const Course = require("../models/Course");
const Progress = require("../models/Progress");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

// Create lecture (Instructor only)
const createLecture = async (courseId, instructorId, lectureData) => {
    try {
        const course = await Course.findById(courseId);
        if (!course) throw new Error("Course not found");

        if (course.instructor.toString() !== instructorId.toString()) {
            throw new Error("Not authorized to add lectures to this course");
        }

        // ✅ Parse questions if they were sent as a string
        if (lectureData.questions && typeof lectureData.questions === "string") {
            try {
                lectureData.questions = JSON.parse(lectureData.questions);
            } catch {
                throw new Error("Invalid questions format");
            }
        }

        // Determine lecture order
        const lastLecture = await Lecture.findOne({ course: courseId }).sort({ order: -1 });
        const order = lastLecture ? lastLecture.order + 1 : 0;

        const lecture = new Lecture({
            ...lectureData,
            course: courseId,
            order
        });

        await lecture.save();

        // Add lecture to course
        course.lectures.push(lecture._id);
        await course.save();

        // Update student progress for all enrolled students
        await Progress.updateMany(
            { course: courseId },
            {
                $push: {
                    lecturesProgress: {
                        lecture: lecture._id,
                        completed: false
                    }
                },
                $inc: { totalLectures: 1 }
            }
        );

        return lecture;
    } catch (error) {
        console.error("Error creating lecture:", error);
        throw new Error(error.message);
    }
};


// Get lecture (Students see it based on progress)
const getLecture = async (lectureId, userId, userRole) => {
    try {
        // Fetch lecture and populate course info
        const lecture = await Lecture.findById(lectureId)
            .populate("course", "title instructor");

        if (!lecture) throw new Error("Lecture not found");

        // ---------- 🧑‍🏫 Instructor Access ----------
        if (userRole === "instructor") {
            if (lecture.course.instructor.toString() !== userId.toString()) {
                throw new Error("Not authorized to view this lecture");
            }
            return lecture;
        }

        // ---------- 🧑‍🎓 Student Access ----------
        if (userRole === "student") {
            const progress = await Progress.findOne({
                student: userId,
                course: lecture.course._id,
            });

            if (!progress) throw new Error("Not enrolled in this course");

            const lectureProgress = progress.lecturesProgress.find(
                (lp) => lp.lecture.toString() === lectureId.toString()
            );

            if (!lectureProgress) throw new Error("Lecture not found in course");

            // Enforce sequential lecture completion
            const allLectures = await Lecture.find({ course: lecture.course._id })
                .sort({ order: 1 });

            const currentLectureIndex = allLectures.findIndex(
                (l) => l._id.toString() === lectureId.toString()
            );

            for (let i = 0; i < currentLectureIndex; i++) {
                const prevLectureProgress = progress.lecturesProgress.find(
                    (lp) => lp.lecture.toString() === allLectures[i]._id.toString()
                );
                if (!prevLectureProgress || !prevLectureProgress.completed) {
                    throw new Error("Complete previous lectures first");
                }
            }

            // ---------- 🧩 Quiz Handling ----------
            if (lecture.type === "quiz" && !lectureProgress.completed) {
                const sanitizedLecture = lecture.toObject();
                sanitizedLecture.questions = sanitizedLecture.questions.map((q) => ({
                    _id: q._id,
                    questionText: q.questionText,
                    options: q.options,
                }));
                return sanitizedLecture;
            }

            // ✅ Ensure Cloudinary file URL is accessible
            if (lecture.fileUrl && !lecture.fileUrl.startsWith("http")) {
                // Optional safeguard in case old local uploads still exist
                lecture.fileUrl = `${process.env.BASE_URL}${lecture.fileUrl}`;
            }

            return lecture;
        }

        // ---------- ❌ Invalid Role ----------
        throw new Error("Invalid user role");
    } catch (error) {
        console.error("Error fetching lecture:", error);
        throw new Error(error.message || "Failed to get lecture");
    }
};

// Update lecture (Instructor only)
const updateLecture = async (lectureId, instructorId, updateData) => {
    try {
        const lecture = await Lecture.findById(lectureId).populate("course");
        if (!lecture) throw new Error("Lecture not found");

        if (lecture.course.instructor.toString() !== instructorId.toString()) {
            throw new Error("Not authorized to update this lecture");
        }

        delete updateData.course;
        delete updateData.order;

        Object.assign(lecture, updateData);
        await lecture.save();

        return lecture;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Delete lecture (Instructor only)
const deleteLecture = async (lectureId, instructorId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const lecture = await Lecture.findById(lectureId)
            .populate("course")
            .session(session);

        if (!lecture) throw new Error("Lecture not found");

        if (lecture.course.instructor.toString() !== instructorId.toString()) {
            throw new Error("Not authorized to delete this lecture");
        }

        // ✅ Delete the file from Cloudinary if it exists
        if (lecture.fileUrl && lecture.fileUrl.includes("res.cloudinary.com")) {
            try {
                // Extract public_id from the Cloudinary URL
                // Example: https://res.cloudinary.com/demo/video/upload/v1234567890/lectures/abc123.mp4
                const parts = lecture.fileUrl.split("/");
                const publicIdWithExt = parts.slice(-2).join("/").split(".")[0]; // lectures/abc123
                await cloudinary.uploader.destroy(publicIdWithExt, { resource_type: "auto" });
            } catch (err) {
                console.warn("Cloudinary deletion failed:", err.message);
            }
        }

        // ✅ Remove lecture reference from course
        await Course.findByIdAndUpdate(
            lecture.course._id,
            { $pull: { lectures: lectureId } },
            { session }
        );

        // ✅ Update student progress
        await Progress.updateMany(
            { course: lecture.course._id },
            {
                $pull: { lecturesProgress: { lecture: lectureId } },
                $inc: { totalLectures: -1 },
            },
            { session }
        );

        // ✅ Delete lecture record
        await Lecture.findByIdAndDelete(lectureId).session(session);

        await session.commitTransaction();
        return { message: "Lecture and file deleted successfully" };
    } catch (error) {
        await session.abortTransaction();
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
};

// Complete reading lecture
const completeReading = async (lectureId, studentId) => {
    try {
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) throw new Error("Lecture not found");

        if (lecture.type !== 'reading') {
            throw new Error("This is not a reading lecture");
        }

        const progress = await Progress.findOne({
            student: studentId,
            course: lecture.course
        });
        if (!progress) throw new Error("Not enrolled in this course");

        const lectureProgress = progress.lecturesProgress.find(
            lp => lp.lecture.toString() === lectureId.toString()
        );
        if (!lectureProgress) throw new Error("Lecture not found in progress");

        if (!lectureProgress.completed) {
            lectureProgress.completed = true;
            lectureProgress.completedAt = new Date();

            const nextLecture = await Lecture.findOne({
                course: lecture.course,
                order: { $gt: lecture.order }
            }).sort({ order: 1 });

            if (nextLecture) {
                progress.currentLecture = nextLecture._id;
            }
        }

        await progress.save();

        return {
            message: "Lecture completed",
            progress: {
                completedLectures: progress.completedLectures,
                totalLectures: progress.totalLectures,
                progressPercentage: progress.progressPercentage
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Submit quiz
const submitQuiz = async (lectureId, studentId, answers) => {
    try {
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) throw new Error("Lecture not found");

        if (lecture.type !== 'quiz') throw new Error("This is not a quiz lecture");

        const progress = await Progress.findOne({
            student: studentId,
            course: lecture.course
        });
        if (!progress) throw new Error("Not enrolled in this course");

        const lectureProgress = progress.lecturesProgress.find(
            lp => lp.lecture.toString() === lectureId.toString()
        );
        if (!lectureProgress) throw new Error("Lecture not found in progress");

        // Grade the quiz
        let correctAnswers = 0;
        const gradedAnswers = answers.map((answer, index) => {
            const question = lecture.questions[index];
            const isCorrect = question && answer.selectedOption === question.correctAnswer;
            if (isCorrect) correctAnswers++;
            return {
                questionIndex: index,
                selectedOption: answer.selectedOption,
                correctAnswer: question.correctAnswer,
                isCorrect
            };
        });

        const score = Math.round((correctAnswers / lecture.questions.length) * 100);
        const passed = score >= lecture.passingScore;

        lectureProgress.quizAttempts.push({
            answers: answers.map((a, i) => ({
                questionIndex: i,
                selectedOption: a.selectedOption
            })),
            score,
            passed
        });

        if (score > (lectureProgress.bestScore || 0)) {
            lectureProgress.bestScore = score;
        }

        if (passed && !lectureProgress.completed) {
            lectureProgress.completed = true;
            lectureProgress.completedAt = new Date();

            const nextLecture = await Lecture.findOne({
                course: lecture.course,
                order: { $gt: lecture.order }
            }).sort({ order: 1 });

            if (nextLecture) {
                progress.currentLecture = nextLecture._id;
            }
        }

        await progress.save();

        return {
            score,
            passed,
            correctAnswers,
            totalQuestions: lecture.questions.length,
            passingScore: lecture.passingScore,
            gradedAnswers,
            message: passed
                ? "Quiz passed! Lecture completed."
                : "Quiz failed. Try again to unlock the next lecture.",
            progress: {
                completedLectures: progress.completedLectures,
                totalLectures: progress.totalLectures,
                progressPercentage: progress.progressPercentage
            }
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get course lectures (for navigation)
const getCourseLectures = async (courseId, userId, userRole) => {
    try {
        const course = await Course.findById(courseId);
        if (!course) throw new Error("Course not found");

        const lectures = await Lecture.find({ course: courseId })
            .select("title type order")
            .sort({ order: 1 });

        if (userRole === "student") {
            const progress = await Progress.findOne({
                student: userId,
                course: courseId
            });
            if (!progress) throw new Error("Not enrolled in this course");

            const lecturesWithProgress = lectures.map(lecture => {
                const lectureProgress = progress.lecturesProgress.find(
                    lp => lp.lecture.toString() === lecture._id.toString()
                );
                return {
                    ...lecture.toObject(),
                    completed: lectureProgress ? lectureProgress.completed : false,
                    isAccessible:
                        lecture._id.toString() === progress.currentLecture?.toString() ||
                        (lectureProgress && lectureProgress.completed)
                };
            });

            return lecturesWithProgress;
        }

        return lectures;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    createLecture,
    getLecture,
    updateLecture,
    deleteLecture,
    completeReading,
    submitQuiz,
    getCourseLectures
};
