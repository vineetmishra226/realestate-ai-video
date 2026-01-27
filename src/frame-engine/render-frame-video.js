const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("../services/ffmpeg.service");

/**
 * Phase 11.3.C
 * Diagonal Dolly + Parallax + Forward Dolly + Micro Camera Rotation
 * Built on locked Phase 11.2.1 foundation
 */

// Filmic velocity curve (LOCKED)
function filmicCurve(t) {
  if (t < 0.15) {
    return (t / 0.15) * (t / 0.15) * 0.15;
  }
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

  const totalFrames = durationSeconds * fps;

  const outputDir = path.dirname(outputPath);
  const frameDir = path.join(outputDir, "frames_parallax_dolly_rotate");
  fs.mkdirSync(frameDir, { recursive: true });

  const finalW = width;
  const finalH = height;

  const camW = finalW * oversample;
  const camH = finalH * oversample;

  /**
   * Depth layers (fixed)
   */
  const bgOverscan = 1.20;
  const fgOverscan = 1.35;

  const bgW = Math.round(camW * bgOverscan);
  const bgH = Math.round(camH * bgOverscan);

  const fgW = Math.round(camW * fgOverscan);
  const fgH = Math.round(camH * fgOverscan);

  const bgPath = path.join(frameDir, "__bg.png");
  const fgPath = path.join(frameDir, "__fg.png");

  await sharp(imagePath)
    .resize(bgW, bgH, { fit: "cover", position: "centre" })
    .toFile(bgPath);

  await sharp(imagePath)
    .resize(fgW, fgH, { fit: "cover", position: "centre" })
    .toFile(fgPath);

  /**
   * Diagonal dolly paths (unchanged)
   */
  const bgStartX = Math.round((bgW - camW) * 0.20);
  const bgStartY = Math.round((bgH - camH) * 0.18);
  const bgEndX = Math.round((bgW - camW) * 0.45);
  const bgEndY = Math.round((bgH - camH) * 0.50);

  const fgStartX = Math.round((fgW - camW) * 0.10);
  const fgStartY = Math.round((fgH - camH) * 0.08);
  const fgEndX = Math.round((fgW - camW) * 0.65);
  const fgEndY = Math.round((fgH - camH) * 0.70);

  /**
   * Forward dolly strengths (LOCKED)
   */
  const forwardStrengthBG = 0.03;
  const forwardStrengthFG = 0.10;

  /**
   * Micro rotation (TOTAL over entire shot)
   * Extremely subtle, single direction
   */
  const maxYaw = degToRad(0.25);   // left → right
  const maxPitch = degToRad(0.15); // down → up

  for (let i = 0; i < totalFrames; i++) {
    const t = i / (totalFrames - 1);
    const v = filmicCurve(t);
    const f = v * v;

    // Rotation angles (smooth, monotonic)
    const yaw = maxYaw * v;
    const pitch = maxPitch * v;

    // Background crop
    const bgX =
      Math.round(bgStartX + (bgEndX - bgStartX) * v) +
      Math.round((bgW - camW) * forwardStrengthBG * f);
    const bgY =
      Math.round(bgStartY + (bgEndY - bgStartY) * v) +
      Math.round((bgH - camH) * forwardStrengthBG * f);

    let bgFrame = await sharp(bgPath)
      .extract({
        left: bgX,
        top: bgY,
        width: camW,
        height: camH,
      })
      .rotate((yaw + pitch) * (180 / Math.PI), {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    // Foreground crop (stronger motion)
    const fgX =
      Math.round(fgStartX + (fgEndX - fgStartX) * v) +
      Math.round((fgW - camW) * forwardStrengthFG * f);
    const fgY =
      Math.round(fgStartY + (fgEndY - fgStartY) * v) +
      Math.round((fgH - camH) * forwardStrengthFG * f);

    let fgFrame = await sharp(fgPath)
      .extract({
        left: fgX,
        top: fgY,
        width: camW,
        height: camH,
      })
      .rotate((yaw + pitch) * (180 / Math.PI), {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    const framePath = path.join(
      frameDir,
      `frame_${String(i).padStart(5, "0")}.png`
    );

    await sharp(bgFrame)
      .composite([{ input: fgFrame }])
      .toFile(framePath);
  }

  // Encode (unchanged)
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
      .on("start", cmd => console.log("FFmpeg encode command:\n", cmd))
      .on("error", err => reject(err))
      .on("end", () => resolve(outputPath))
      .run();
  });
}

module.exports = {
  renderFrameBasedVideo,
};
