/**
 * Fast render preset
 * Used for previews, drafts, quick turnaround
 */
module.exports = {
  name: "fast",
  label: "Fast (Preview)",

  video: {
    codec: "libx264",
    preset: "veryfast",
    crf: 28,
    profile: "high",
    level: "4.2"
  },

  audio: {
    codec: "aac",
    bitrate: "128k"
  }
};
