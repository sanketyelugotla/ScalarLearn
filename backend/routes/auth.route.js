const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate role
        if (!['student', 'instructor'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be 'student' or 'instructor'"
            });
        }

        const emailLower = email.toLowerCase();

        let user = await User.findOne({ email: emailLower });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        user = new User({
            name,
            email: emailLower,
            password,
            role
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailLower = email.toLowerCase();

        const user = await User.findOne({ email: emailLower });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(401).json({ success: false, message: error.message });
    }
});

// Get User Details
router.get("/details", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User verified successfully",
            user
        });
    } catch (error) {
        console.error("Error getting details:", error);
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;