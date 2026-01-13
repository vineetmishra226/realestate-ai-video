const path = require("path");

// Profiles
const landscape = require("./profiles/landscape");
const square = require("./profiles/square");
const vertical = require("./profiles/vertical");

// Presets
const fast = require("./presets/fast");
const high = require("./presets/high-quality");

/**
 * Registry
 */
const PROFILES = {
  landscape,
  square,
  vertical
};

const PRESETS = {
  fast,
  high
};

/**
 * Build a render plan
 * This function does NOT render anything
 */
function buildRenderPlan(options = {}) {
  const profileName = options.profile || "landscape";
  const presetName = options.preset || "high";

  const profile = PROFILES[profileName];
  if (!profile) {
    throw new Error(`Unknown video profile: ${profileName}`);
  }

  const preset = PRESETS[presetName];
  if (!preset) {
    throw new Error(`Unknown quality preset: ${presetName}`);
  }

  const outputDir = options.outputDir || process.cwd();
  const outputFileName = `${profile.name}-${preset.name}.mp4`;

  return {
    profile,
    preset,

    output: {
      path: path.join(outputDir, outputFileName),
      filename: outputFileName
    },

    video: {
      width: profile.resolution.width,
      height: profile.resolution.height,
      fps: profile.fps,

      codec: preset.video.codec,
      crf: preset.video.crf,
      preset: preset.video.preset,
      profile: preset.video.profile,
      level: preset.video.level
    },

    audio: {
      codec: preset.audio.codec,
      bitrate: preset.audio.bitrate
    }
  };
}

module.exports = {
  buildRenderPlan,
  PROFILES,
  PRESETS
};
