const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("../services/ffmpeg.service");

/**
 * Phase 11.2.1
 * Filmic velocity curve on top of oversampled, stable frame engine
 */

// Filmic velocity curve:
// - fast ease-in
// - long linear middle
// - gentle ease-out
function filmicCurve(t) {
  if (t < 0.15) {
    // ease-in (fast)
    return (t / 0.15) * (t / 0.15) * 0.15;
  }

  if (t > 0.85) {
    // ease-out
    const u = (t - 0.85) / 0.15;
    return 0.85 + (1 - Math.pow(1 - u, 2)) * 0.15;
  }

  // linear middle (cruise)
  return t;
}

async function renderFrameBasedVideo({
  imagePath,
  outputPath,
  width = 1280,
  height = 720,
  durationSeconds = 7,
  fps = 30,
  oversample = 2,
}) {
  if (!fs.existsSync(imagePath)) {
    throw new Error("Input image does not exist");
  }

  const totalFrames = durationSeconds * fps;

  const outputDir = path.dirname(outputPath);
  const frameDir = path.join(outputDir, "frames_filmic");

  fs.mkdirSync(frameDir, { recursive: true });

  const finalW = width;
  const finalH = height;

  const camW = finalW * oversample;
  const camH = finalH * oversample;

  const overscan = 1.18;
  const canvasW = Math.round(camW * overscan);
  const canvasH = Math.round(camH * overscan);

  const canvasPath = path.join(frameDir, "__canvas.png");

  // Resize ONCE
  await sharp(imagePath)
    .resize(canvasW, canvasH, {
      fit: "cover",
      position: "centre",
    })
    .toFile(canvasPath);

  const startX = Math.round((canvasW - camW) / 2);
  const startY = Math.round((canvasH - camH) / 2);

  // Slightly stronger travel for cinematic feel
  const endX = Math.round(startX * 0.8);
  const endY = Math.round(startY * 0.8);

  for (let i = 0; i < totalFrames; i++) {
    const t = i / (totalFrames - 1);
    const v = filmicCurve(t);

    const x = Math.round(startX + (endX - startX) * v);
    const y = Math.round(startY + (endY - startY) * v);

    const framePath = path.join(
      frameDir,
      `frame_${String(i).padStart(5, "0")}.png`
    );

    await sharp(canvasPath)
      .extract({
        left: x,
        top: y,
        width: camW,
        height: camH,
      })
      .toFile(framePath);
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(frameDir, "frame_%05d.png"))
      .inputOptions([`-framerate ${fps}`])
      .outputOptions([
        `-vf scale=${finalW}:${finalH}`,
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-movflags +faststart",
        "-y",
      ])
      .output(outputPath)
      .on("start", cmd => {
        console.log("FFmpeg encode command:\n", cmd);
      })
      .on("error", err => reject(err))
      .on("end", () => resolve(outputPath))
      .run();
  });
}

module.exports = {
  renderFrameBasedVideo,
};
