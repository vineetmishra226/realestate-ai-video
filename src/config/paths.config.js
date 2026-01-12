const path = require("path");

const ROOT = path.resolve(__dirname, "../../");

module.exports = {
  root: ROOT,

  assets: {
    images: path.join(ROOT, "assets", "images"),
    audio: path.join(ROOT, "assets", "voiceover.wav")
  },

  output: {
    video: path.join(ROOT, "final_horizontal.mp4")
  },

  ffmpeg: {
    bin: "C:/ffmpeg/bin/ffmpeg.exe",
    probe: "C:/ffmpeg/bin/ffprobe.exe"
  }
};
