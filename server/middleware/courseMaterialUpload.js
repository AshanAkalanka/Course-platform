const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'materials');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExts = /jpg|jpeg|png|webp|pdf|mp4|webm|mov|avi/;
    const allowedMimes = /image\/(jpeg|png|webp)|application\/pdf|video\/(mp4|webm|quicktime|x-msvideo)/;

    const extOk = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowedMimes.test(file.mimetype);

    if (extOk && mimeOk) {
        cb(null, true);
    } else {
        cb(new Error('Only images, PDFs, and video files are allowed'));
    }
};

const courseMaterialUpload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter
});

module.exports = courseMaterialUpload;
