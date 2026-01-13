/**
 * CLI entry point
 */

const fs = require("fs");
const path = require("path");

const { buildRenderPlan } = require("./src/video/video-pipeline");

const command = process.argv[2];
const args = process.argv.slice(3);

let profile = "landscape";
let preset = "high";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--profile" && args[i + 1]) {
    profile = args[i + 1];
  }
  if (args[i] === "--preset" && args[i + 1]) {
    preset = args[i + 1];
  }
}

async function run() {
  try {
    switch (command) {
      case "preview": {
        const { showAgentPreview } = require("./src/tools/agent-preview");
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

        const listing = adaptPreviewToListing(previewJson);

        const renderPlan = buildRenderPlan({
          profile,
          preset,
          outputDir: process.cwd()
        });

        console.log("🎬 Render plan:");
        console.log(renderPlan);

        await renderVideo(listing, renderPlan);

        console.log("✅ Video render completed");
        break;
      }

      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

run();
