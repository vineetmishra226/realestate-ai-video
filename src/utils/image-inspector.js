const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");

/**
 * Conservative but practical image quality check.
 */
function isHighQualityImage(imagePath) {
  if (!fs.existsSync(imagePath)) return false;

  const ext = path.extname(imagePath).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) return false;

  const stats = fs.statSync(imagePath);

  // Reject very tiny files (icons, logos)
  const MIN_FILE_SIZE_BYTES = 50 * 1024; // 50 KB
  if (stats.size < MIN_FILE_SIZE_BYTES) return false;

  try {
    const dimensions = sizeOf(imagePath);

    const MIN_WIDTH = 800;
    const MIN_HEIGHT = 600;

    if (dimensions.width < MIN_WIDTH || dimensions.height < MIN_HEIGHT) {
      return false;
    }
  } catch (err) {
    // If image can't be read, reject it
    return false;
  }

  return true;
}

function filterHighQualityImages(images) {
  return images.filter(isHighQualityImage);
}

module.exports = {
  filterHighQualityImages
};
