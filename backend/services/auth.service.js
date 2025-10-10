const { User } = require("../models/index.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// 📌 Register User
const registerUser = async ({ name, email, education, institution, password, role }) => {
    const emailLower = email.toLowerCase();

    let user = await User.findOne({ email: emailLower });
    // console.log(user);
    if (user) throw new Error("User already exists");

    user = new User({ name, email: emailLower, education, institution, password, role });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3h" });
    let newUser = await user.save();
    // console.log(user);

    return { message: "User registered successfully", user, token };
};

// 📌 Login User
const loginUser = async ({ email, password }) => {
    const emailLower = email.toLowerCase();

    const user = await User.findOne({ email: emailLower });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3h" });

    return { token, role: user.role };
};

const getUserDetails = async (req) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id).select("-password");
        if (!user) throw new Error("Cannot find user");
        return user;
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}


module.exports = {
    registerUser,
    loginUser,
    getUserDetails
};
