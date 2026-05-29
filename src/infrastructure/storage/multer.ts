import multer from "multer";

// 1.Tell Multer to keep the file in RAM buffer memory
const storage = multer.memoryStorage();

// 2. Set strict validation limits
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {

    // Read the mime type Multer extracted from the file
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export default upload;
