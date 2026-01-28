const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("../services/ffmpeg.service");

/**
 * Phase 12.2
 * Depth-weighted cinematic motion
 * SAFE: Depth only modulates forward dolly strength
 */

// Filmic velocity curve (LOCKED)
function filmicCurve(t) {
  if (t < 0.15) return (t / 0.15) * (t / 0.15) * 0.15;
  if (t > 0.85) {
    const u = (t - 0.85) / 0.15;
    return 0.85 + (1 - Math.pow(1 - u, 2)) * 0.15;
  }
  return t;
}

// Degrees → radians
function degToRad(d) {
  return (d * Math.PI) / 180;
}

async function renderFrameBasedVideo({
  imagePath,
  outputPath,
  width = 1280,
  height = 720,
  durationSeconds = 8,
  fps = 30,
  oversample = 2,
}) {
  if (!fs.existsSync(imagePath)) {
    throw new Error("Input image does not exist");
  }

  const depthPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, ".depth.png");
  if (!fs.existsSync(depthPath)) {
    throw new Error("Depth map missing for image");
  }

  const totalFrames = durationSeconds * fps;
  const outputDir = path.dirname(outputPath);
  const frameDir = path.join(outputDir, "frames_depth_weighted");
  fs.mkdirSync(frameDir, { recursive: true });

  const finalW = width;
  const finalH = height;
  const camW = finalW * oversample;
  const camH = finalH * oversample;

  /**
   * Load depth map ONCE
   */
  const depthBuffer = await sharp(depthPath)
    .resize(camW, camH, { fit: "fill" })
    .raw()
    .toBuffer();

  /**
   * Compute stable depth weights
   * We use percentiles to avoid noise
   */
  let sumNear = 0;
  let sumFar = 0;
  let count = depthBuffer.length;

  for (let i = 0; i < count; i++) {
    const d = depthBuffer[i] / 255;
    sumNear += d;
    sumFar += 1 - d;
  }

  const depthWeightFG = sumNear / count; // nearer = larger
  const depthWeightBG = sumFar / count;  // farther = smaller

  /**
   * Base motion strengths (LOCKED)
   */
  const baseForwardBG = 0.03;
  const baseForwardFG = 0.10;

  const forwardBG = baseForwardBG * depthWeightBG;
  const forwardFG = baseForwardFG * depthWeightFG;

  /**
   * Overscan layers
   */
  const bgOverscan = 1.20;
  const fgOverscan = 1.35;

  const bgW = Math.round(camW * bgOverscan);
  const bgH = Math.round(camH * bgOverscan);
  const fgW = Math.round(camW * fgOverscan);
  const fgH = Math.round(camH * fgOverscan);

  const bgPath = path.join(frameDir, "__bg.png");
  const fgPath = path.join(frameDir, "__fg.png");

  await sharp(imagePath).resize(bgW, bgH).toFile(bgPath);
  await sharp(imagePath).resize(fgW, fgH).toFile(fgPath);

  /**
   * Diagonal dolly paths (LOCKED)
   */
  const bgStartX = (bgW - camW) * 0.20;
  const bgStartY = (bgH - camH) * 0.18;
  const bgEndX = (bgW - camW) * 0.45;
  const bgEndY = (bgH - camH) * 0.50;

  const fgStartX = (fgW - camW) * 0.10;
  const fgStartY = (fgH - camH) * 0.08;
  const fgEndX = (fgW - camW) * 0.65;
  const fgEndY = (fgH - camH) * 0.70;

  /**
   * Micro rotation (LOCKED)
   */
  const maxYaw = degToRad(0.25);
  const maxPitch = degToRad(0.15);

  for (let i = 0; i < totalFrames; i++) {
    const t = i / (totalFrames - 1);
    const v = filmicCurve(t);
    const f = v * v;

    const yaw = maxYaw * v;
    const pitch = maxPitch * v;

    const bgX =
      Math.round(bgStartX + (bgEndX - bgStartX) * v +
      (bgW - camW) * forwardBG * f);

    const bgY =
      Math.round(bgStartY + (bgEndY - bgStartY) * v +
      (bgH - camH) * forwardBG * f);

    const fgX =
      Math.round(fgStartX + (fgEndX - fgStartX) * v +
      (fgW - camW) * forwardFG * f);

    const fgY =
      Math.round(fgStartY + (fgEndY - fgStartY) * v +
      (fgH - camH) * forwardFG * f);

    const bgFrame = await sharp(bgPath)
      .extract({ left: bgX, top: bgY, width: camW, height: camH })
      .rotate((yaw + pitch) * 180 / Math.PI, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const fgFrame = await sharp(fgPath)
      .extract({ left: fgX, top: fgY, width: camW, height: camH })
      .rotate((yaw + pitch) * 180 / Math.PI, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const framePath = path.join(frameDir, `frame_${String(i).padStart(5, "0")}.png`);
    await sharp(bgFrame).composite([{ input: fgFrame }]).toFile(framePath);
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

module.exports = { renderFrameBasedVideo };
