const mongoose = require("mongoose");

const lectureProgressSchema = new mongoose.Schema({
    lecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    bestScore: {
        type: Number,
        default: 0
    },
    quizAttempts: [
        {
            answers: [
                {
                    questionIndex: Number,
                    selectedOption: String
                }
            ],
            score: Number,
            passed: Boolean,
            attemptedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

const progressSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        currentLecture: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture"
        },
        lecturesProgress: [lectureProgressSchema],
        totalLectures: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Virtual field: completedLectures
progressSchema.virtual("completedLectures").get(function () {
    return this.lecturesProgress.filter(lp => lp.completed).length;
});

// Virtual field: progressPercentage
progressSchema.virtual("progressPercentage").get(function () {
    if (this.totalLectures === 0) return 0;
    return Math.round((this.completedLectures / this.totalLectures) * 100);
});

// Include virtuals in JSON output
progressSchema.set("toObject", { virtuals: true });
progressSchema.set("toJSON", { virtuals: true });

// Unique compound index to prevent duplicate enrollments
progressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
