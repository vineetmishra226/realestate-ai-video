const fs = require("fs");
const path = require("path");

const {
  renderFrameBasedVideo,
} = require("../frame-engine/render-frame-video");

/**
 * PERMANENT CINEMATIC RENDER PIPELINE
 *
 * - FFmpeg concat REMOVED
 * - zoompan REMOVED
 * - images.txt REMOVED
 * - Frame-based engine is the ONLY renderer
 * - FFmpeg is encoder only (inside frame engine)
 */
module.exports = async function renderVideo(
  listing,
  renderPlan,
  onProgress
) {
  const images = listing.images;

  if (!images || images.length === 0) {
    throw new Error("No images provided for render");
  }

  // Phase 11+ cinematic engine renders ONE image
  const imagePath = path.resolve(images[0]);

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Input image not found: ${imagePath}`);
  }

  const outputPath = renderPlan.output.path;
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const width = renderPlan.video.width;
  const height = renderPlan.video.height;
  const fps = renderPlan.video.fps;

  onProgress?.(5);

  const result = await renderFrameBasedVideo({
    imagePath,
    outputPath,
    width,
    height,
    fps,
    durationSeconds: 8, // locked cinematic duration
    oversample: 2,
  });

  onProgress?.(100);

  return result;
};
