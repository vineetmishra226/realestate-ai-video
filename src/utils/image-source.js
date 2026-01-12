const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../../uploads/images");

function getImageSource(previewImages) {
  if (fs.existsSync(UPLOAD_DIR)) {
    const uploaded = fs
      .readdirSync(UPLOAD_DIR)
      .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
      .map(f => path.join(UPLOAD_DIR, f));

    if (uploaded.length > 0) {
      return {
        type: "uploaded",
        images: uploaded
      };
    }
  }

  return {
    type: "preview",
    images: previewImages || []
  };
}

module.exports = { getImageSource };
