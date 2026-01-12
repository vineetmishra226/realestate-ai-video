/**
 * High quality render preset
 * Used for final delivery and publishing
 */
module.exports = {
  name: "high",
  label: "High Quality",

  video: {
    codec: "libx264",
    preset: "slow",
    crf: 18,
    profile: "high",
    level: "4.2"
  },

  audio: {
    codec: "aac",
    bitrate: "192k"
  }
};
