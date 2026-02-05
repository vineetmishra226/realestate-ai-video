const path = require("path");
const fs = require("fs");
const { renderFrameBasedVideo } = require("../frame-engine/render-frame-video");

module.exports = async function renderVideo(listing, renderPlan, onProgress) {
  console.log("🔥🔥 PHASE 13 PIPELINE ACTIVE 🔥🔥");

  const images = listing.images.map(p => path.join(process.cwd(), p));
  if (images.length < 2) {
    throw new Error("Phase 13 requires at least 2 images");
  }

  const outputPath = renderPlan.output.path;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  onProgress?.(10);

  const result = await renderFrameBasedVideo({
    imagePaths: images,
    outputPath,
    width: renderPlan.video.width,
    height: renderPlan.video.height,
    fps: renderPlan.video.fps,
    secondsPerImage: 6,
  });

  onProgress?.(100);
  return result;
};
