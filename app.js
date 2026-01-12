/**
 * CLI entry point
 *
 * Commands:
 *   node app.js preview
 *   node app.js render
 */

const fs = require("fs");
const path = require("path");

const command = process.argv[2];

async function run() {
  try {
    switch (command) {
      case "preview": {
        const { showAgentPreview } = require("./src/tools/agent-preview");

        console.log("🧾 Showing agent preview...");
        showAgentPreview();
        break;
      }

      case "render": {
        const renderVideo = require("./src/pipelines/video.pipeline");
        const adaptPreviewToListing = require(
          "./src/adapters/preview-to-listing.adapter"
        );

        const previewPath = path.join(
          __dirname,
          "preview",
          "listing-preview.json"
        );

        if (!fs.existsSync(previewPath)) {
          throw new Error("listing-preview.json not found. Run preview first.");
        }

        const previewJson = JSON.parse(
          fs.readFileSync(previewPath, "utf-8")
        );

        // ✅ THIS IS THE FIX
        const listing = adaptPreviewToListing(previewJson);

        console.log("🎬 Starting video render...");
        await renderVideo(listing);

        console.log("✅ Video render completed");
        break;
      }

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log("");
        console.log("Available commands:");
        console.log("  node app.js preview");
        console.log("  node app.js render");
        process.exit(1);
    }
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

run();
