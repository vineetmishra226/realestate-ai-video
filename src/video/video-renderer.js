const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");

ffmpeg.setFfmpegPath("C:\\ffmpeg\\bin\\ffmpeg.exe");
ffmpeg.setFfprobePath("C:\\ffmpeg\\bin\\ffprobe.exe");

const PREVIEW_PATH = path.join(__dirname, "../../preview/listing-preview.json");
const ASSETS_DIR = path.join(__dirname, "../../assets/render");
const OUTPUT_DIR = path.join(__dirname, "../../output");
const TEMP_VIDEO = path.join(OUTPUT_DIR, "temp-video.mp4");
const FINAL_VIDEO = path.join(OUTPUT_DIR, "final-video.mp4");
const AUDIO_PATH = path.join(__dirname, "../../assets/voiceover.wav");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function downloadImage(url, index) {
  const imgPath = path.join(ASSETS_DIR, `img_${index}.jpg`);
  const response = await axios.get(url, { responseType: "stream" });

  return new Promise(resolve => {
    response.data.pipe(fs.createWriteStream(imgPath)).on("finish", () => {
      resolve(imgPath);
    });
  });
}

async function prepareImages(images) {
  ensureDir(ASSETS_DIR);
  fs.readdirSync(ASSETS_DIR).forEach(f =>
    fs.unlinkSync(path.join(ASSETS_DIR, f))
  );

  const paths = [];
  for (let i = 0; i < images.length; i++) {
    paths.push(await downloadImage(images[i], i));
  }
  return paths;
}

async function createSlideshow(imagePaths) {
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg();

    imagePaths.forEach(img => {
      cmd = cmd.input(img).inputOptions(["-loop 1", "-t 3"]);
    });

    cmd
      .on("start", console.log)
      .on("error", reject)
      .on("end", resolve)
      .outputOptions([
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-profile:v high",
        "-level 4.2",
        "-r 30",
        "-shortest"
      ])
      .save(TEMP_VIDEO);
  });
}

async function addAudio() {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(TEMP_VIDEO)
      .input(AUDIO_PATH)
      .outputOptions([
        "-c:v copy",
        "-c:a aac",
        "-ac 2",
        "-ar 48000",
        "-movflags +faststart",
        "-shortest"
      ])
      .on("error", reject)
      .on("end", resolve)
      .save(FINAL_VIDEO);
  });
}

async function renderVideo() {
  ensureDir(OUTPUT_DIR);

  if (!fs.existsSync(PREVIEW_PATH)) {
    throw new Error("listing-preview.json not found");
  }
  if (!fs.existsSync(AUDIO_PATH)) {
    throw new Error("voiceover.wav not found");
  }

  const preview = JSON.parse(fs.readFileSync(PREVIEW_PATH, "utf-8"));
  if (!preview.images || preview.images.length === 0) {
    throw new Error("No images available");
  }

  const imagePaths = await prepareImages(preview.images);
  await createSlideshow(imagePaths);
  await addAudio();

  fs.unlinkSync(TEMP_VIDEO);

  console.log("✅ Final video created:", FINAL_VIDEO);
}

module.exports = { renderVideo };
