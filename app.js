/**
 * CLI entry point
 *
 * Commands:
 *   node app.js preview
 *   node app.js render
 *   node app.js render --profile youtube
 *   node app.js render --profile instagram
 */

const fs = require("fs");
const path = require("path");
const renderProfiles = require("./render-profiles");

const command = process.argv[2];
const args = process.argv.slice(3);

// ---------------------------
// Parse --profile argument
// ---------------------------
let profileKey = "youtube"; // default

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--profile" && args[i + 1]) {
    profileKey = args[i + 1];
  }
}

// Validate render profile (only needed for render)
let profile = null;
if (command === "render") {
  profile = renderProfiles[profileKey];

  if (!profile) {
    console.error(`❌ Unknown render profile: ${profileKey}`);
    console.log("Available profiles:");
    Object.keys(renderProfiles).forEach((key) => {
      console.log(`  - ${key}`);
    });
    process.exit(1);
  }

  console.log(`🎯 Using render profile: ${profile.label}`);
}

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

        // Convert preview → listing domain object
        const listing = adaptPreviewToListing(previewJson);

        console.log("🎬 Starting video render...");
        await renderVideo(listing, profile); // 🔑 profile passed here

        console.log("✅ Video render completed");
        break;
      }

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log("");
        console.log("Available commands:");
        console.log("  node app.js preview");
        console.log("  node app.js render");
        console.log("  node app.js render --profile youtube");
        console.log("  node app.js render --profile instagram");
        process.exit(1);
    }
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

run();
