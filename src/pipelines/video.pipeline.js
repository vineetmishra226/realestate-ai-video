const ffmpeg = require("../services/ffmpeg.service");
const videoConfig = require("../config/video.config");
const paths = require("../config/paths.config");

module.exports = async function renderVideo(listing) {
  if (!listing.isValid()) {
    throw new Error("Invalid listing data");
  }

  const images = listing.images;

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    images.forEach(img => {
      command = command.input(img).inputOptions([
        "-loop 1",
        `-t ${videoConfig.timing.imageDurationSeconds}`
      ]);
    });

    command.input(paths.assets.audio);

    const videoFilters = images
      .map((_, i) =>
        `[${i}:v]scale=${videoConfig.output.width}:${videoConfig.output.height}:force_original_aspect_ratio=decrease,` +
        `pad=${videoConfig.output.width}:${videoConfig.output.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`
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
        `-c:v ${videoConfig.video.codec}`,
        `-pix_fmt ${videoConfig.video.pixelFormat}`,
        `-profile:v ${videoConfig.video.profile}`,
        `-level ${videoConfig.video.level}`,
        `-r ${videoConfig.output.fps}`,
        `-c:a ${videoConfig.audio.codec}`,
        "-profile:a aac_low",
        `-ac ${videoConfig.audio.channels}`,
        `-ar ${videoConfig.audio.sampleRate}`,
        "-movflags +faststart",
        "-shortest",
        "-y"
      ])
      .save(paths.output.video)
      .on("end", resolve)
      .on("error", reject);
  });
};
