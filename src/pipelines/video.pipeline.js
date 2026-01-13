const ffmpeg = require("../services/ffmpeg.service");
const videoConfig = require("../config/video.config");
const paths = require("../config/paths.config");

/**
 * Render final video
 * @param {Object} listing - validated listing domain object
 * @param {Object} profile - optional render profile (Phase 6.4)
 */
module.exports = async function renderVideo(listing, profile) {
  if (!listing.isValid()) {
    throw new Error("Invalid listing data");
  }

  const images = listing.images;

  // ---------------------------
  // Resolve output settings
  // ---------------------------
  const output = {
    width: profile?.width ?? videoConfig.output.width,
    height: profile?.height ?? videoConfig.output.height,
    fps: profile?.fps ?? videoConfig.output.fps,
    videoBitrate: profile?.videoBitrate,
    audioBitrate: profile?.audioBitrate,
    outputFile: profile?.outputFile ?? paths.output.video
  };

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // ---------------------------
    // Image inputs
    // ---------------------------
    images.forEach((img) => {
      command = command.input(img).inputOptions([
        "-loop 1",
        `-t ${videoConfig.timing.imageDurationSeconds}`
      ]);
    });

    // ---------------------------
    // Audio input
    // ---------------------------
    command.input(paths.assets.audio);

    // ---------------------------
    // Video filters
    // ---------------------------
    const videoFilters = images
      .map(
        (_, i) =>
          `[${i}:v]scale=${output.width}:${output.height}:force_original_aspect_ratio=decrease,` +
          `pad=${output.width}:${output.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`
      )
      .join(";");

    const concatFilter =
      images.map((_, i) => `[v${i}]`).join("") +
      `concat=n=${images.length}:v=1:a=0[outv]`;

    // ---------------------------
    // FFmpeg pipeline
    // ---------------------------
    command
      .complexFilter([
        `${videoFilters};${concatFilter}`,
        {
          filter: "aresample",
          options: "async=1:first_pts=0",
          inputs: `${images.length}:a`,
          outputs: "outa"
        }
      ])
      .outputOptions([
        "-map [outv]",
        "-map [outa]",
        `-c:v ${videoConfig.video.codec}`,
        `-pix_fmt ${videoConfig.video.pixelFormat}`,
        `-profile:v ${videoConfig.video.profile}`,
        `-level ${videoConfig.video.level}`,
        `-r ${output.fps}`,
        ...(output.videoBitrate ? [`-b:v ${output.videoBitrate}`] : []),
        `-c:a ${videoConfig.audio.codec}`,
        ...(output.audioBitrate ? [`-b:a ${output.audioBitrate}`] : []),
        "-profile:a aac_low",
        `-ac ${videoConfig.audio.channels}`,
        `-ar ${videoConfig.audio.sampleRate}`,
        "-movflags +faststart",
        "-shortest",
        "-y"
      ])
      .save(output.outputFile)
      .on("end", resolve)
      .on("error", reject);
  });
};
