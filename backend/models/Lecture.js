const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required']
    },
    options: {
        type: [String],
        required: [true, 'Options are required'],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length >= 2;
            },
            message: 'A question must have at least 2 options'
        }
    },
    correctAnswer: {
        type: String,
        required: [true, 'Correct answer is required'],
        validate: {
            validator: function(v) {
                return this.options && this.options.includes(v);
            },
            message: 'Correct answer must be one of the provided options'
        }
    }
});

const LectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    type: {
        type: String,
        enum: {
            values: ['reading', 'quiz'],
            message: '{VALUE} is not a valid lecture type. Must be reading or quiz.'
        },
        required: [true, 'Lecture type is required']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course reference is required']
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
    // For reading lectures
    content: {
        type: String,
        trim: true
    },
    contentLink: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        trim: true
    },
    fileName: {
        type: String,
        trim: true
    },
    // For quiz lectures
    questions: [questionSchema],
    passingScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100
    },
    duration: {
        type: Number, // in minutes
        default: null
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Validation: reading must have content or link, quiz must have questions
LectureSchema.pre('save', function(next) {
    if (this.type === 'reading') {
        if (!this.content && !this.contentLink && !this.fileUrl) {
            return next(new Error('Reading lecture must have content, contentLink, or fileUrl'));
        }
    }
    
    if (this.type === 'quiz') {
        if (!this.questions || this.questions.length === 0) {
            return next(new Error('Quiz lecture must have at least one question'));
        }
    }
    
    next();
});

// Index for efficient queries
LectureSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model("Lecture", LectureSchema);
