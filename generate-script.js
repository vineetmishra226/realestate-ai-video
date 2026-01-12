const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

// IMPORTANT: Explicit FFmpeg paths
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/ffmpeg/bin/ffprobe.exe");

// Paths
const IMAGES_DIR = path.join(__dirname, "assets", "images");
const AUDIO_PATH = path.join(__dirname, "assets", "voiceover.wav");
const OUTPUT = path.join(__dirname, "final_horizontal.mp4");

// Settings
const IMAGE_DURATION = 4; // seconds per image
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;

async function createHorizontalVideo() {
  // ---- VALIDATION ----
  if (!fs.existsSync(AUDIO_PATH)) {
    throw new Error("❌ voiceover.wav not found in assets folder");
  }

  const images = fs
    .readdirSync(IMAGES_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .map(f => path.join(IMAGES_DIR, f));

  if (images.length === 0) {
    throw new Error("❌ No images found in assets/images");
  }

  console.log(`🖼 Images found: ${images.length}`);
  console.log(`🔊 Using audio: ${AUDIO_PATH}`);

  // ---- BUILD FFMPEG COMMAND ----
  let cmd = ffmpeg();

  images.forEach(img => {
    cmd = cmd.input(img).inputOptions([
      "-loop 1",
      `-t ${IMAGE_DURATION}`
    ]);
  });

  cmd.input(AUDIO_PATH);

  // ---- VIDEO FILTERS (SAFE LANDSCAPE) ----
  const videoFilters = images
    .map((_, i) =>
      `[${i}:v]scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,` +
      `pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`
    )
    .join(";");

  const concatFilter =
    images.map((_, i) => `[v${i}]`).join("") +
    `concat=n=${images.length}:v=1:a=0[outv]`;

  // ---- EXECUTE ----
  return new Promise((resolve, reject) => {
    cmd
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
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-profile:v high",
        "-level 4.2",
        `-r ${FPS}`,
        "-c:a aac",
        "-profile:a aac_low",
        "-ac 2",
        "-ar 48000",
        "-movflags +faststart",
        "-shortest",
        "-y"
      ])
      .save(OUTPUT)
      .on("start", cmdLine => {
        console.log("🚀 FFmpeg started");
      })
      .on("end", () => {
        console.log("✅ Video created successfully:");
        console.log("📁", OUTPUT);
        resolve();
      })
      .on("error", err => {
        console.error("❌ FFmpeg error:", err.message);
        reject(err);
      });
  });
}

// ---- RUN ----
createHorizontalVideo().catch(err => {
  console.error("❌ FAILURE:", err.message);
});
