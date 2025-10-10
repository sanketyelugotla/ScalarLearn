const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary"); // configured instance

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "courses",
        resource_type: "auto",
    },
});

const upload = multer({ storage });

module.exports = upload;
