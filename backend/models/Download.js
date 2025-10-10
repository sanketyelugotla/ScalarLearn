const mongoose = require("mongoose");

const DownloadSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User is required']
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
        required: [true, 'Resource is required']
    },
    downloadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
DownloadSchema.index({ user: 1, downloadedAt: -1 });
DownloadSchema.index({ resource: 1, downloadedAt: -1 });

module.exports = mongoose.model("Download", DownloadSchema);