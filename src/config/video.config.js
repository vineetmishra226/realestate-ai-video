module.exports = {
  output: {
    width: 1280,
    height: 720,
    fps: 30,
    format: "mp4"
  },

  audio: {
    sampleRate: 48000,
    channels: 2,
    codec: "aac"
  },

  video: {
    codec: "libx264",
    pixelFormat: "yuv420p",
    profile: "high",
    level: "4.2"
  },

  timing: {
    imageDurationSeconds: 4
  }
};
