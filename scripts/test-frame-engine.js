const path = require("path");
const {
  renderFrameBasedVideo,
} = require("../src/frame-engine/render-frame-video");

(async () => {
  try {
    const inputImage = path.join(
      __dirname,
      "..",
      "uploads",
      "projects",
      "demo",
      "1768623491929-457119769.jpg"
    );

    const outputVideo = path.join(
      __dirname,
      "..",
      "uploads",
      "projects",
      "demo",
      "videos",
      "diagonal_dolly_parallax_forward_rotate.mp4"
    );

    console.log("▶ Starting cinematic render…");

    await renderFrameBasedVideo({
      imagePath: inputImage,
      outputPath: outputVideo,
      width: 1280,
      height: 720,
      durationSeconds: 8,
      fps: 30,
      oversample: 2,
    });

    console.log("✅ Render complete");
    console.log("🎬 Output:", outputVideo);
  } catch (err) {
    console.error("❌ Render failed");
    console.error(err);
  }
})();
