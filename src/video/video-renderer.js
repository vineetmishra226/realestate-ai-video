const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const config = require("../config");
const { getImageSource } = require("../utils/image-source");

/* =========================
   FFmpeg setup
========================= */
ffmpeg.setFfmpegPath(config.ffmpeg.path);
ffmpeg.setFfprobePath(config.ffmpeg.ffprobePath);

/* =========================
   Paths
========================= */
const PREVIEW_PATH = path.join(__dirname, "../../preview/listing-preview.json");
const ASSETS_DIR = path.join(__dirname, "../../assets/render");
const NORMALIZED_DIR = path.join(ASSETS_DIR, "normalized");
const OUTPUT_DIR = path.join(__dirname, "../../", config.output.directory);
const AUDIO_PATH = path.join(__dirname, "../../", config.audio.path);

/* =========================
   Helpers
========================= */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(item => {
    const full = path.join(dir, item);
    fs.rmSync(full, { recursive: true, force: true });
  });
}

function safeUnlink(file) {
  if (fs.existsSync(file)) {
    try { fs.unlinkSync(file); } catch (_) {}
  }
}

/* =========================
   Image handling
========================= */
async function fetchImage(src, index) {
  const rawPath = path.join(ASSETS_DIR, `raw_${index}`);

  if (src.startsWith("http")) {
    const res = await axios.get(src, { responseType: "arraybuffer" });
    fs.writeFileSync(rawPath, res.data);
  } else {
    fs.copyFileSync(src, rawPath);
  }

  return rawPath;
}

async function normalizeImage(inputPath, index, width, height) {
  const outPath = path.join(NORMALIZED_DIR, `img_${index}.jpg`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-y",
        `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
        "-pix_fmt yuv420p"
      ])
      .output(outPath)
      .on("error", reject)
      .on("end", () => resolve(outPath))
      .run();
  });
}

async function prepareImages(images, plan) {
  ensureDir(ASSETS_DIR);
  ensureDir(NORMALIZED_DIR);

  cleanDir(ASSETS_DIR);
  ensureDir(NORMALIZED_DIR);

  for (let i = 0; i < images.length; i++) {
    const raw = await fetchImage(images[i], i);
    await normalizeImage(
      raw,
      i,
      plan.video.width,
      plan.video.height
    );
    safeUnlink(raw);
  }

  const normalized = fs
    .readdirSync(NORMALIZED_DIR)
    .filter(f => f.endsWith(".jpg"));

  if (normalized.length === 0) {
    throw new Error("Image normalization failed");
  }
}

/* =========================
   Video creation
========================= */
async function createVideoFromImages(plan, tempVideoPath) {
  const pattern = path
    .join(NORMALIZED_DIR, "img_%d.jpg")
    .replace(/\\/g, "/");

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(pattern)
      .inputOptions([
        "-start_number 0",
        `-framerate 1/${config.video.imageDurationSeconds}`
      ])
      .outputOptions([
        "-y",
        "-c:v", plan.video.codec,
        "-pix_fmt yuv420p",
        "-profile:v", plan.video.profile,
        "-level", plan.video.level,
        "-preset", plan.video.preset,
        "-crf", String(plan.video.crf),
        `-r ${plan.video.fps}`,
        "-movflags +faststart"
      ])
      .output(tempVideoPath)
      .on("error", reject)
      .on("end", resolve)
      .run();
  });
}

/* =========================
   Add audio
========================= */
async function addAudio(plan, tempVideoPath, finalVideoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(tempVideoPath)
      .input(AUDIO_PATH)
      .outputOptions([
        "-y",
        "-map 0:v:0",
        "-map 1:a:0",
        "-c:v copy",
        "-c:a", plan.audio.codec,
        "-b:a", plan.audio.bitrate,
        "-movflags +faststart",
        "-shortest"
      ])
      .output(finalVideoPath)
      .on("error", reject)
      .on("end", resolve)
      .run();
  });
}

/* =========================
   Public API
========================= */
async function renderVideo(plan) {
  if (!plan) throw new Error("Render plan missing");

  ensureDir(OUTPUT_DIR);

  const tempVideoPath = path.join(OUTPUT_DIR, "temp-video.mp4");
  const finalVideoPath = path.join(
    OUTPUT_DIR,
    plan.output.filename
  );

  if (!fs.existsSync(PREVIEW_PATH)) {
    throw new Error("listing-preview.json missing");
  }

  if (!fs.existsSync(AUDIO_PATH)) {
    throw new Error("Audio file missing");
  }

  const preview = JSON.parse(fs.readFileSync(PREVIEW_PATH, "utf-8"));
  if (!preview.images || preview.images.length === 0) {
    throw new Error("No images available");
  }

  const source = getImageSource(preview.images);

  console.log(
    source.type === "uploaded"
      ? "📸 Using agent-uploaded images"
      : "🌐 Using listing images"
  );

  console.log("🎬 Normalizing images...");
  await prepareImages(source.images, plan);

  console.log("🎞 Creating video...");
  await createVideoFromImages(plan, tempVideoPath);

  console.log("🔊 Adding audio...");
  await addAudio(plan, tempVideoPath, finalVideoPath);

  safeUnlink(tempVideoPath);

  console.log("✅ Final video created:", finalVideoPath);
}

module.exports = { renderVideo };
