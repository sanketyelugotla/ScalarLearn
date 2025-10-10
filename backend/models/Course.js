const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'Instructor is required']
    },
    lectures: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture"
    }],
    totalLectures: {
        type: Number,
        default: 0
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isPublished: {
        type: Boolean,
        default: true
    },
    thumbnail: {
        type: String,
        default: null
    },
    category: {
        type: String,
        default: 'General'
    }
}, {
    timestamps: true
});

// Update totalLectures when lectures array changes
CourseSchema.pre('save', function (next) {
    if (this.isModified('lectures')) {
        this.totalLectures = this.lectures.length;
    }
    next();
});

module.exports = mongoose.model("Course", CourseSchema);