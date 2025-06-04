// config/multer-simple.js (create this new file for testing)
const multer = require('multer');

// Simple memory storage for debugging
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 Simple multer - File received:', file.originalname);
    cb(null, true); // Accept all files for now
  }
});

module.exports = { upload };