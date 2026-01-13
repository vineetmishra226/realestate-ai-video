// render-profiles.js
// Phase 6.5 hardened render profiles

module.exports = {
  preview: {
    id: "preview",
    type: "preview",
    label: "Preview (Fast)",
    width: 640,
    height: 360,
    fps: 24,
    videoBitrate: "1200k",
    audioBitrate: "96k",
    preset: "veryfast",
    outputFile: "preview.mp4",
    safe: true
  },

  youtube: {
    id: "youtube",
    type: "landscape",
    label: "YouTube Landscape (16:9)",
    width: 1920,
    height: 1080,
    fps: 30,
    videoBitrate: "5000k",
    audioBitrate: "192k",
    preset: "medium",
    outputFile: "final_youtube.mp4",
    safe: true
  },

  instagram: {
    id: "instagram",
    type: "vertical",
    label: "Instagram Reels (9:16)",
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrate: "4500k",
    audioBitrate: "192k",
    preset: "medium",
    outputFile: "final_instagram.mp4",
    safe: true
  }
};
