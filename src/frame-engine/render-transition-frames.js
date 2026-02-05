const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("../services/ffmpeg.service");

/**
 * Phase 13
 * Momentum-preserving transition between two images
 * FRAME-BASED (no FFmpeg motion filters)
 */

async function renderTransition({
  fromImage,
  toImage,
  outputPath,
  width,
  height,
  fps,
  durationFrames = 18, // ~0.6s @ 30fps
  oversample = 2,
}) {
      console.log("🟣🟣 TRANSITION ENGINE ACTIVE 🟣🟣", {
    fromImagePath,
    toImagePath,
    durationFrames
  });
  const finalW = width;
  const finalH = height;
  const camW = finalW * oversample;
  const camH = finalH * oversample;

  const outDir = path.dirname(outputPath);
  const frameDir = path.join(outDir, "frames_transition");
  fs.mkdirSync(frameDir, { recursive: true });

  const overscan = 1.3;
  const imgW = Math.round(camW * overscan);
  const imgH = Math.round(camH * overscan);

  const aPath = path.join(frameDir, "__A.png");
  const bPath = path.join(frameDir, "__B.png");

  await sharp(fromImage).resize(imgW, imgH).toFile(aPath);
  await sharp(toImage).resize(imgW, imgH).toFile(bPath);

  const startX = Math.round((imgW - camW) * 0.35);
  const startY = Math.round((imgH - camH) * 0.35);
  const endX   = Math.round((imgW - camW) * 0.45);
  const endY   = Math.round((imgH - camH) * 0.45);

  for (let i = 0; i < durationFrames; i++) {
    const t = i / (durationFrames - 1);

    // Camera continues moving
    const x = Math.round(startX + (endX - startX) * t);
    const y = Math.round(startY + (endY - startY) * t);

    const alphaB = Math.min(1, t * 1.4); // image B fades in
    const alphaA = 1 - alphaB;

    const framePath = path.join(
      frameDir,
      `frame_${String(i).padStart(5, "0")}.png`
    );

    const aFrame = await sharp(aPath)
      .extract({ left: x, top: y, width: camW, height: camH })
      .toBuffer();

    const bFrame = await sharp(bPath)
      .extract({ left: x, top: y, width: camW, height: camH })
      .toBuffer();

    await sharp(aFrame)
      .composite([
        { input: bFrame, blend: "over", opacity: alphaB },
      ])
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
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}

module.exports = { renderTransition };
