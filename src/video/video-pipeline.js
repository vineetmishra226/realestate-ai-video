const fs = require("fs");
const path = require("path");
const ffmpeg = require("../services/ffmpeg.service");

module.exports = async function renderVideo(
  listing,
  renderPlan,
  onProgress
) {
  const images = listing.images;

  if (!images || images.length === 0) {
    throw new Error("No images provided for render");
  }

  const rawOutputPath = renderPlan.output.path;
  const outputPath = rawOutputPath.replace(/\\/g, "/");

  const width = renderPlan.video.width;
  const height = renderPlan.video.height;
  const fps = renderPlan.video.fps;

  const imageDuration = 3; // seconds
  const totalFrames = imageDuration * fps;

  const startZoom = 1.0;
  const endZoom = 1.08; // subtle cinematic zoom

  // Ensure output directory exists
  const outputDir = path.dirname(rawOutputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Build concat file
  const concatFilePath = path.join(outputDir, "images.txt");
  const concatFile = concatFilePath.replace(/\\/g, "/");

  const concatContent = images
    .map(img => {
      const normalized = img.replace(/\\/g, "/");
      return `file '${normalized}'\nduration ${imageDuration}`;
    })
    .join("\n");

  fs.writeFileSync(concatFilePath, concatContent);

  /**
   * Smooth Ken Burns zoom formula
   * zoom = start + (end - start) * (on / totalFrames)
   */
  const zoomExpression = `${startZoom} + (${endZoom}-${startZoom})*(on/${totalFrames})`;

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFile)
      .inputOptions([
        "-f concat",
        "-safe 0",
      ])
      .videoFilters([
        // 1. Scale & pad (even dimensions, no distortion)
        {
          filter: "scale",
          options: {
            w: width,
            h: height,
            force_original_aspect_ratio: "decrease",
          },
        },
        {
          filter: "pad",
          options: {
            w: width,
            h: height,
            x: "(ow-iw)/2",
            y: "(oh-ih)/2",
          },
        },

        // 2. Smooth Ken Burns zoom (NO jitter)
        {
          filter: "zoompan",
          options: {
            z: zoomExpression,
            x: "iw/2-(iw/zoom/2)",
            y: "ih/2-(ih/zoom/2)",
            d: totalFrames,
            s: `${width}x${height}`,
          },
        },
      ])
      .outputOptions([
        "-c:v libx264",
        "-pix_fmt yuv420p",
        `-r ${fps}`,
        "-movflags +faststart",
        "-y",
      ])
      .output(outputPath)
      .on("start", cmd => {
        console.log("FFmpeg command:\n", cmd);
      })
      .on("progress", p => {
        if (p.percent && onProgress) {
          onProgress(Math.min(99, Math.floor(p.percent)));
        }
      })
      .on("error", err => {
        console.error("FFmpeg error:", err.message);
        reject(err);
      })
      .on("end", () => {
        if (onProgress) onProgress(100);
        resolve(outputPath);
      })
      .run();
  });
};
