const { User } = require("../models");
const authenticate = require("./authenticate");

async function authenticateInstructor(req, res, next) {
    try {
        await authenticate(req, res, async () => {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            if (user.role === "instructor") {
                req.user.role = user.role; // Attach role to request
                return next();
            }
            return res.status(403).json({
                success: false,
                message: "Access denied. Instructor role required."
            });
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = authenticateInstructor;