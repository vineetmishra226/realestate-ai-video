/**
 * Render Plan Schema
 * This is the ONLY contract video-renderer understands
 */
module.exports = {
  version: "1.0",

  video: {
    width: 1920,
    height: 1080,
    fps: 30,
    imageDurationSeconds: 3,
    profile: "landscape"
  },

  images: [
    {
      path: "",
      order: 1
    }
  ],

  audio: {
    enabled: true,
    path: "",
    channels: 2,
    sampleRate: 48000
  },

  output: {
    filename: "final-video.mp4",
    directory: "output"
  }
};
