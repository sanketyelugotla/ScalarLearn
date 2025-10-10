const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email is already taken'],
        lowercase: true
    },
    education: {
        type: String,
    },
    institution: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: {
            values: ["student", "instructor"],
            message: '{VALUE} is not a valid role. Allowed roles are student and instructor.'
        },
        required: [true, 'Role is required']
    },
    // Add saved resources array
    savedResources: [{
        resource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: true
        },
        savedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Add user statistics
    totalResourcesSaved: {
        type: Number,
        default: 0
    },
    totalQuizzesAttempted: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

// Update statistics when savedResources is modified
UserSchema.pre("save", function (next) {
    if (this.isModified("savedResources")) {
        this.totalResourcesSaved = this.savedResources.length;
    }
    next();
});

// Password hashing middleware
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password.trim(), 10);
        next();
    } catch (error) {
        console.log("Error in hashing password:", error);
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password) {
    try {
        const isMatch = await bcrypt.compare(password.trim(), this.password.trim());
        return isMatch;
    } catch (error) {
        console.log("Error in password comparison:", error);
        throw error;
    }
};

// Method to save a resource
UserSchema.methods.saveResource = async function (resourceId) {
    try {
        // Check if resource is already saved
        const isAlreadySaved = this.savedResources.some(
            saved => saved.resource.toString() === resourceId.toString()
        );

        if (!isAlreadySaved) {
            this.savedResources.push({
                resource: resourceId,
                savedAt: new Date()
            });
            await this.save();
            return true;
        }
        return false; // Already saved
    } catch (error) {
        throw error;
    }
};

// Method to unsave a resource
UserSchema.methods.unsaveResource = async function (resourceId) {
    try {
        this.savedResources = this.savedResources.filter(
            saved => saved.resource.toString() !== resourceId.toString()
        );
        await this.save();
        return true;
    } catch (error) {
        throw error;
    }
};

// Method to check if resource is saved
UserSchema.methods.isResourceSaved = function (resourceId) {
    return this.savedResources.some(
        saved => saved.resource.toString() === resourceId.toString()
    );
};

module.exports = mongoose.model("User", UserSchema);