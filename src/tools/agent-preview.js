const fs = require("fs");
const path = require("path");
const { getImageSource } = require("../utils/image-source");

// --------------------
// Paths
// --------------------
const PREVIEW_PATH = path.join(
  __dirname,
  "../../preview/listing-preview.json"
);

// --------------------
// Helpers
// --------------------
function print(label, value) {
  console.log(`${label}: ${value || "—"}`);
}

function printImages(images) {
  if (!images || images.length === 0) {
    console.log("❌ No images available");
    return;
  }

  images.forEach((img, index) => {
    console.log(`  ${index + 1}. ${img}`);
  });
}

// --------------------
// Agent Preview
// --------------------
function showAgentPreview() {
  if (!fs.existsSync(PREVIEW_PATH)) {
    throw new Error("listing-preview.json not found");
  }

  const preview = JSON.parse(fs.readFileSync(PREVIEW_PATH, "utf-8"));
  const imageSource = getImageSource(preview.images);

  console.log("\n================================");
  console.log("🏡 LISTING PREVIEW (AGENT VIEW)");
  console.log("================================\n");

  print("Title", preview.title);
  print("Price", preview.price);
  print("Address", preview.address);

  console.log("");
  console.log(
    imageSource.type === "uploaded"
      ? "📸 Images (Uploaded by agent):"
      : "🌐 Images (From listing):"
  );

  printImages(imageSource.images);

  console.log("\nScript:");
  console.log("--------");
  console.log(preview.script || "—");

  console.log("\n================================\n");
}

module.exports = { showAgentPreview };
