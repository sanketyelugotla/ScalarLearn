const User = require("../models/User");
const Resource = require("../models/Resource");
const QuizAttempt = require("../models/QuizAttempt");
const Blog = require("../models/Blog");
const Project = require("../models/Project");
const Quizz = require("../models/Quizz");
const mongoose = require("mongoose");
const { Quiz, Download } = require("../models");

// Get all users
const getUsers = async () => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('savedResources.resource', 'name typeOfFile')
            .sort({ createdAt: -1 });
        return users;
    } catch (error) {
        throw error;
    }
};

// Get user by ID
const getUser = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select('-password')
            .populate('savedResources.resource', 'name description typeOfFile typeOfMaterial');

        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw error;
    }
};

// Get user profile with complete data
const getUserProfile = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate({
                path: 'savedResources.resource',
                select: 'name description typeOfFile typeOfMaterial sizeOfFile author',
                populate: {
                    path: 'author',
                    select: 'name'
                }
            })
            .select('-password');

        if (!user) {
            throw new Error('User not found');
        }

        // Get recent quiz attempts
        const recentQuizAttempts = await QuizAttempt.find({ user: userId })
            .populate('quiz', 'title category level')
            .sort({ attemptedAt: -1 })
            .limit(5);

        // Get quiz statistics
        const quizStats = await QuizAttempt.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: "$percentage" },
                    highestScore: { $max: "$percentage" },
                    totalTimeSpent: { $sum: "$timeSpent" }
                }
            }
        ]);

        return {
            user,
            recentQuizAttempts,
            quizStatistics: quizStats[0] || {
                totalAttempts: 0,
                averageScore: 0,
                highestScore: 0,
                totalTimeSpent: 0
            }
        };
    } catch (error) {
        throw error;
    }
};

// Update user
const updateUser = async (userId, updateData) => {
    try {
        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.password;
        delete updateData.role;
        delete updateData.savedResources;
        // console.log(updateData)

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        console.log(user)
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw error;
    }
};

// Delete user
const deleteUser = async (userId) => {
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw error;
    }
};

// Save resource
const saveResource = async (userId, resourceId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            throw new Error('Resource not found');
        }

        const saved = await user.saveResource(resourceId);

        if (saved) {
            // Increment noOfSaves
            resource.noOfSaves = (resource.noOfSaves || 0) + 1;
            await resource.save();

            return { success: true, message: 'Resource saved successfully' };
        } else {
            return { success: false, message: 'Resource already saved' };
        }
    } catch (error) {
        throw error;
    }
};

// Unsave resource
const unsaveResource = async (userId, resourceId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            throw new Error('Resource not found');
        }

        const removed = await user.unsaveResource(resourceId);

        if (removed) {
            resource.noOfSaves = Math.max((resource.noOfSaves || 0) - 1, 0);
            await resource.save();
        }

        return true;
    } catch (error) {
        throw error;
    }
};


// Get saved resources
const getSavedResources = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate({
                path: 'savedResources.resource',
                populate: {
                    path: 'author',
                    select: 'name'
                }
            })
            .select('savedResources');

        if (!user) {
            throw new Error('User not found');
        }

        return user.savedResources;
    } catch (error) {
        throw error;
    }
};

// Check if resource is saved
const isResourceSaved = async (userId, resourceId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return user.isResourceSaved(resourceId);
    } catch (error) {
        throw error;
    }
};

// Get user quiz attempts
const getUserQuizAttempts = async (userId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;

        const attempts = await QuizAttempt.find({ user: userId })
            .populate('quiz', 'title category level')
            .sort({ attemptedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await QuizAttempt.countDocuments({ user: userId });

        return {
            attempts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalAttempts: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        throw error;
    }
};

// Get user quiz statistics
const getUserQuizStats = async (userId) => {
    try {
        const stats = await QuizAttempt.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: "$percentage" },
                    highestScore: { $max: "$percentage" },
                    lowestScore: { $min: "$percentage" },
                    totalTimeSpent: { $sum: "$timeSpent" }
                }
            }
        ]);

        // Get category-wise performance
        const categoryStats = await QuizAttempt.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'quizzs',
                    localField: 'quiz',
                    foreignField: '_id',
                    as: 'quizDetails'
                }
            },
            { $unwind: '$quizDetails' },
            {
                $group: {
                    _id: '$quizDetails.category',
                    attempts: { $sum: 1 },
                    averageScore: { $avg: '$percentage' },
                    highestScore: { $max: '$percentage' }
                }
            }
        ]);

        return {
            overall: stats[0] || {
                totalAttempts: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                totalTimeSpent: 0
            },
            byCategory: categoryStats
        };
    } catch (error) {
        throw error;
    }
};

// Get user dashboard data
const getUserDashboard = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password');

        if (!user) {
            throw new Error("User not found");
        }

        // Count values
        const savedResourcesCount = user.savedResources.length;
        const quizAttemptsCount = await QuizAttempt.countDocuments({ user: userId });
        const createdBlogsCount = await Blog.countDocuments({ author: userId });
        const createdProjectsCount = await Project.countDocuments({ author: userId });
        const createdQuizzesCount = await Quiz.countDocuments({ author: userId });
        const downloadCount = await Download.countDocuments({ user: userId });

        // Recent quiz attempts
        const recentQuizAttempts = await QuizAttempt.find({ user: userId })
            .populate('quiz', 'title')
            .sort({ attemptedAt: -1 })
            .limit(3);

        // Recent saved resources
        const recentSavedResources = user.savedResources
            .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
            .slice(0, 3);

        // Recent downloaded resources
        const recentDownloads = await Download.find({ user: userId })
            .populate('resource', 'title description')
            .sort({ downloadedAt: -1 })
            .limit(3);

        return {
            counts: {
                savedResources: savedResourcesCount,
                quizAttempts: quizAttemptsCount,
                createdBlogs: createdBlogsCount,
                createdProjects: createdProjectsCount,
                createdQuizzes: createdQuizzesCount,
                downloads: downloadCount
            },
            recentActivities: {
                quizAttempts: recentQuizAttempts,
                savedResources: recentSavedResources,
                downloads: recentDownloads
            }
        };
    } catch (error) {
        throw error;
    }
};

// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        user.password = newPassword;
        await user.save();

        return true;
    } catch (error) {
        throw error;
    }
};

// Get user activity (placeholder - you can expand this)
const getUserActivity = async (userId, limit = 20) => {
    try {
        // This is a simplified version - you might want to create an Activity model
        const activities = [];

        // Get recent quiz attempts
        const quizAttempts = await QuizAttempt.find({ user: userId })
            .populate('quiz', 'title')
            .sort({ attemptedAt: -1 })
            .limit(limit);

        quizAttempts.forEach(attempt => {
            activities.push({
                type: 'quiz_attempt',
                description: `Attempted quiz: ${attempt.quiz.title}`,
                score: attempt.percentage,
                timestamp: attempt.attemptedAt
            });
        });

        // Sort by timestamp
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return activities.slice(0, limit);
    } catch (error) {
        throw error;
    }
};

// Get user's created content
const getUserContent = async (userId) => {
    try {
        const blogs = await Blog.find({ author: userId })
            .select('title description date type')
            .sort({ createdAt: -1 });

        const projects = await Project.find({ author: userId })
            .select('title description category date')
            .sort({ createdAt: -1 });

        const quizzes = await Quiz.find({ author: userId })
            .select('title description category level questions usersAttempted')
            .sort({ createdAt: -1 });

        return {
            blogs,
            projects,
            quizzes,
            totalContent: blogs.length + projects.length + quizzes.length
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getUsers,
    getUser,
    getUserProfile,
    updateUser,
    deleteUser,
    saveResource,
    unsaveResource,
    getSavedResources,
    isResourceSaved,
    getUserQuizAttempts,
    getUserQuizStats,
    getUserDashboard,
    changePassword,
    getUserActivity,
    getUserContent
};