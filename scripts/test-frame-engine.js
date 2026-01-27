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
      "frame_based_filmic.mp4"
    );

    await renderFrameBasedVideo({
      imagePath: inputImage,
      outputPath: outputVideo,
      width: 1280,
      height: 720,
      durationSeconds: 7,
      fps: 30,
    });

    console.log("✅ Filmic motion rendered");
  } catch (err) {
    console.error("❌ Render failed:", err);
  }
})();
