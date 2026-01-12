/**
 * Landscape video profile (16:9)
 * Universal default: YouTube, websites, presentations
 */
module.exports = {
  name: "landscape",
  label: "Landscape (16:9)",
  aspectRatio: "16:9",

  resolution: {
    width: 1920,
    height: 1080
  },

  fps: 30,

  safeArea: {
    top: 0.05,
    bottom: 0.05,
    left: 0.05,
    right: 0.05
  }
};
