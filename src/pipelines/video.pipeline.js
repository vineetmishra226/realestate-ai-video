const ffmpeg = require("../services/ffmpeg.service");
const paths = require("../config/paths.config");

/**
 * Render final video using a render plan
 * @param {Object} listing
 * @param {Object} renderPlan
 */
module.exports = async function renderVideo(listing, renderPlan) {
  if (!listing.isValid()) {
    throw new Error("Invalid listing data");
  }

  if (!renderPlan) {
    throw new Error("Render plan is required (Phase 6.6)");
  }

  const images = listing.images;

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // ---------------------------
    // Image inputs
    // ---------------------------
    images.forEach((img) => {
      command = command.input(img).inputOptions([
        "-loop 1",
        "-t 3"
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
          `[${i}:v]scale=${renderPlan.video.width}:${renderPlan.video.height}:force_original_aspect_ratio=decrease,` +
          `pad=${renderPlan.video.width}:${renderPlan.video.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`
      )
      .join(";");

    const concatFilter =
      images.map((_, i) => `[v${i}]`).join("") +
      `concat=n=${images.length}:v=1:a=0[outv]`;

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
        `-c:v ${renderPlan.video.codec}`,
        `-preset ${renderPlan.video.preset}`,
        `-profile:v ${renderPlan.video.profile}`,
        `-level ${renderPlan.video.level}`,
        `-r ${renderPlan.video.fps}`,
        ...(renderPlan.video.crf ? [`-crf ${renderPlan.video.crf}`] : []),
        `-c:a ${renderPlan.audio.codec}`,
        ...(renderPlan.audio.bitrate ? [`-b:a ${renderPlan.audio.bitrate}`] : []),
        "-movflags +faststart",
        "-shortest",
        "-y"
      ])
      .save(renderPlan.output.path)
      .on("end", resolve)
      .on("error", reject);
  });
};
