const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("../services/ffmpeg.service");

/**
 * PHASE 15A
 * - Phase 14 motion & blending LOCKED
 * - Context-aware transition timing
 * - NO camera changes
 */

function filmicCurve(t) {
  if (t < 0.15) return (t / 0.15) ** 2 * 0.15;
  if (t > 0.85) {
    const u = (t - 0.85) / 0.15;
    return 0.85 + (1 - (1 - u) ** 2) * 0.15;
  }
  return t;
}

/**
 * Phase 15A: transition timing rules
 */
function getTransitionProfile(index, totalImages, framesPerImage) {
  // defaults
  let duration = Math.floor(framesPerImage * 0.25);
  let startOffset = framesPerImage - duration;

  // first transition (establishing)
  if (index === 0) {
    duration = Math.floor(framesPerImage * 0.35);
    startOffset = framesPerImage - duration;
  }

  // last image → no dissolve out
  if (index === totalImages - 1) {
    duration = 0;
    startOffset = framesPerImage;
  }

  return { duration, startOffset };
}

async function renderFrameBasedVideo({
  imagePaths,
  outputPath,
  width,
  height,
  fps,
  secondsPerImage = 6,
  oversample = 2,
}) {
  console.log("🔥 PHASE 15A ENGINE ACTIVE 🔥");

  const totalImages = imagePaths.length;
  const framesPerImage = fps * secondsPerImage;
  const totalFrames = framesPerImage * totalImages;

  const outputDir = path.dirname(outputPath);
  const frameDir = path.join(outputDir, "frames_phase15");
  fs.mkdirSync(frameDir, { recursive: true });

  const camW = Math.floor(width * oversample);
  const camH = Math.floor(height * oversample);

  // Pre-resize images
  const layers = [];
  const layerMeta = [];

  for (let i = 0; i < imagePaths.length; i++) {
    const img = imagePaths[i];
    if (!fs.existsSync(img)) throw new Error(`Missing image: ${img}`);

    const layerPath = path.join(frameDir, `layer_${i}.png`);
    const resizedW = Math.floor(camW * 1.4);
    const resizedH = Math.floor(camH * 1.4);

    await sharp(img)
      .resize(resizedW, resizedH, { fit: "cover" })
      .toFile(layerPath);

    layers.push(layerPath);
    layerMeta.push({ w: resizedW, h: resizedH });
  }

  // 🔒 Global camera path (PHASE 14 LOCKED)
  const startX = camW * 0.1;
  const startY = camH * 0.1;
  const endX = camW * 0.4;
  const endY = camH * 0.45;

  // Bresenham-style motion accumulators (LOCKED)
  let fx = startX;
  let fy = startY;
  let ix = Math.floor(fx);
  let iy = Math.floor(fy);
  let errX = 0;
  let errY = 0;

  for (let frame = 0; frame < totalFrames; frame++) {
    const t = filmicCurve(frame / (totalFrames - 1));

    const targetX = startX + (endX - startX) * t;
    const targetY = startY + (endY - startY) * t;

    const dx = targetX - fx;
    const dy = targetY - fy;
    fx = targetX;
    fy = targetY;

    errX += dx;
    errY += dy;

    if (Math.abs(errX) >= 1) {
      ix += Math.sign(errX);
      errX -= Math.sign(errX);
    }
    if (Math.abs(errY) >= 1) {
      iy += Math.sign(errY);
      errY -= Math.sign(errY);
    }

    const imgIndex = Math.min(
      Math.floor(frame / framesPerImage),
      totalImages - 1
    );

    const frameInImage = frame % framesPerImage;
    const { duration, startOffset } = getTransitionProfile(
      imgIndex,
      totalImages,
      framesPerImage
    );

    const inTransition =
      duration > 0 &&
      frameInImage >= startOffset &&
      imgIndex < totalImages - 1;

    const metaA = layerMeta[imgIndex];
    const metaB = layerMeta[imgIndex + 1];

    const x = Math.max(0, Math.min(ix, metaA.w - camW));
    const y = Math.max(0, Math.min(iy, metaA.h - camH));

    const framePath = path.join(
      frameDir,
      `frame_${String(frame).padStart(6, "0")}.png`
    );

    if (!inTransition) {
      await sharp(layers[imgIndex])
        .extract({ left: x, top: y, width: camW, height: camH })
        .resize(width, height)
        .toFile(framePath);
    } else {
      const tt = (frameInImage - startOffset) / duration;

      const bufA = await sharp(layers[imgIndex])
        .extract({ left: x, top: y, width: camW, height: camH })
        .resize(width, height)
        .raw()
        .toBuffer();

      const bufB = await sharp(layers[imgIndex + 1])
        .extract({
          left: Math.max(0, Math.min(x, metaB.w - camW)),
          top: Math.max(0, Math.min(y, metaB.h - camH)),
          width: camW,
          height: camH,
        })
        .resize(width, height)
        .raw()
        .toBuffer();

      const out = Buffer.alloc(bufA.length);
      for (let i = 0; i < bufA.length; i++) {
        out[i] = Math.round(bufA[i] * (1 - tt) + bufB[i] * tt);
      }

      await sharp(out, {
        raw: { width, height, channels: 3 },
      }).toFile(framePath);
    }
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(frameDir, "frame_%06d.png"))
      .inputOptions([`-framerate ${fps}`])
      .outputOptions([
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
