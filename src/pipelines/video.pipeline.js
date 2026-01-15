const ffmpeg = require("../services/ffmpeg.service");
const videoConfig = require("../config/video.config");
const paths = require("../config/paths.config");
const fs = require("fs");
const path = require("path");

/**
 * Render video with progress callback
 */
module.exports = async function renderVideo(
  listing,
  renderPlan,
  onProgress
) {
  if (!listing.isValid()) {
    throw new Error("Invalid listing data");
  }

  const images = listing.images;

  // ✅ CORRECT output directory handling
  const outputDir = path.dirname(renderPlan.output.path);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = renderPlan.output.path;

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // Image inputs
    images.forEach(img => {
      command = command.input(img).inputOptions([
        "-loop 1",
        `-t ${videoConfig.timing.imageDurationSeconds}`,
      ]);
    });

    // Add audio ONLY if it exists
    let hasAudio = false;
    if (
      paths.assets &&
      paths.assets.audio &&
      fs.existsSync(paths.assets.audio)
    ) {
      command = command.input(paths.assets.audio);
      hasAudio = true;
    }

    const videoFilters = images
      .map(
        (_, i) =>
          `[${i}:v]scale=${renderPlan.video.width}:${renderPlan.video.height}:force_original_aspect_ratio=decrease,` +
          `pad=${renderPlan.video.width}:${renderPlan.video.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`
      )
      .join(";");

    const concatFilter =
      images.map((_, i) => `[v${i}]`).join("") +
      `concat=n=${images.length}:v=1:a=0[outv]`;

    const filters = [`${videoFilters};${concatFilter}`];

    if (hasAudio) {
      filters.push({
        filter: "aresample",
        options: "async=1:first_pts=0",
        inputs: `${images.length}:a`,
        outputs: "outa",
      });
    }

    command
      .complexFilter(filters)
      .outputOptions([
        "-map [outv]",
        ...(hasAudio ? ["-map [outa]"] : []),
        `-c:v ${renderPlan.video.codec}`,
        `-profile:v ${renderPlan.video.profile}`,
        `-level ${renderPlan.video.level}`,
        `-r ${renderPlan.video.fps}`,
        ...(hasAudio
          ? [`-c:a ${renderPlan.audio.codec}`]
          : []),
        "-movflags +faststart",
        "-shortest",
        "-y",
      ])
      .save(outputPath)
      .on("progress", progress => {
        if (onProgress && progress.percent) {
          onProgress(Math.min(99, Math.floor(progress.percent)));
        }
      })
      .on("end", () => {
        if (onProgress) onProgress(100);
        resolve(outputPath);
      })
      .on("error", err => {
        reject(err);
      });
  });
};
