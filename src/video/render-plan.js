const path = require("path");

// Profiles
const PROFILES = {
  landscape: {
    name: "landscape",
    resolution: { width: 1280, height: 720 },
    fps: 30,
  },
  square: {
    name: "square",
    resolution: { width: 1080, height: 1080 },
    fps: 30,
  },
  vertical: {
    name: "vertical",
    resolution: { width: 1080, height: 1920 },
    fps: 30,
  },
};

// Presets
const PRESETS = {
  high: {
    name: "high",
    video: {
      codec: "libx264",
    },
  },
};

function buildRenderPlan({
  profile = "landscape",
  preset = "high",
  outputDir,
}) {
  const profileCfg = PROFILES[profile];
  if (!profileCfg) {
    throw new Error(`Unknown profile: ${profile}`);
  }

  const presetCfg = PRESETS[preset];
  if (!presetCfg) {
    throw new Error(`Unknown preset: ${preset}`);
  }

  const filename = `${profile}-${preset}.mp4`;

  return {
    profile,
    preset,

    video: {
      width: profileCfg.resolution.width,
      height: profileCfg.resolution.height,
      fps: profileCfg.fps,
      codec: presetCfg.video.codec,
    },

    output: {
      filename,
      path: path.join(outputDir, filename),
    },
  };
}

module.exports = {
  buildRenderPlan,
};
