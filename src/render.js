const { validateListing } = require("./domain/listing.schema");
const { renderVideo } = require("./video/video-renderer");
const fs = require("fs");
const path = require("path");

const PREVIEW_PATH = path.join(__dirname, "../preview/listing-preview.json");

async function run() {
  if (!fs.existsSync(PREVIEW_PATH)) {
    throw new Error("listing-preview.json not found. Run index.js first.");
  }

  const listing = JSON.parse(fs.readFileSync(PREVIEW_PATH, "utf-8"));

  validateListing(listing);

  await renderVideo();

  console.log("🎬 Video rendering completed");
}

run().catch(err => {
  console.error("❌ Render failed:", err.message);
});
