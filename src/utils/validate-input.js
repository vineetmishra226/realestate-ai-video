const fs = require("fs");
const path = require("path");

module.exports = function validateInput({ previewPath, audioPath }) {
  if (!fs.existsSync(previewPath)) {
    throw new Error("listing-preview.json is missing");
  }

  const preview = JSON.parse(fs.readFileSync(previewPath, "utf-8"));

  if (!preview.images || preview.images.length === 0) {
    throw new Error("No images found in listing-preview.json");
  }

  if (!fs.existsSync(audioPath)) {
    throw new Error("Voiceover audio file not found");
  }

  console.log("✅ Input validation passed");
};
