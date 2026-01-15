const path = require("path");
const fs = require("fs");
const multer = require("multer");

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.body.projectId || "demo";

    const uploadDir = path.join(
      __dirname,
      "../../uploads/projects",
      projectId
    );

    ensureDir(uploadDir);
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per image
  },
});

/**
 * POST /api/upload-images
 * Field name: images
 */
function uploadImages(req, res) {
  upload.array("images")(req, res, err => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    const projectId = req.body.projectId || "demo";

    const images = (req.files || []).map(file => ({
      filename: file.filename,
      path: `/uploads/projects/${projectId}/${file.filename}`,
      absolutePath: file.path,
    }));

    return res.json({
      success: true,
      images,
    });
  });
}

module.exports = uploadImages;
