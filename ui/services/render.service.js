const fs = require("fs");
const path = require("path");

const { buildRenderPlan } = require("../../src/video/video-pipeline");
const renderVideo = require("../../src/pipelines/video.pipeline");
const adaptPreviewToListing = require("../../src/adapters/preview-to-listing.adapter");

const sessionState = require("../state/session.state");

async function render({ profile, preset }) {
  const previewPath = path.join(
    process.cwd(),
    "preview",
    "listing-preview.json"
  );

  if (!fs.existsSync(previewPath)) {
    throw new Error("No preview data found. Run preview first.");
  }

  const previewJson = JSON.parse(fs.readFileSync(previewPath, "utf-8"));
  const listing = adaptPreviewToListing(previewJson);

  const renderPlan = buildRenderPlan({
    profile,
    preset,
    outputDir: process.cwd()
  });

  await renderVideo(listing, renderPlan);

  return {
    file: renderPlan.output.filename,
    path: renderPlan.output.path
  };
}

module.exports = {
  render
};
