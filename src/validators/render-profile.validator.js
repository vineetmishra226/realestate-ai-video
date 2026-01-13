/**
 * Validates render profiles before video rendering
 * Phase 6.5 – Guardrails
 */

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Render profile error: ${message}`);
  }
}

module.exports = function validateRenderProfile(profile) {
  assert(profile, "Profile is required");

  assert(typeof profile.width === "number" && profile.width > 0,
    "width must be a positive number");

  assert(typeof profile.height === "number" && profile.height > 0,
    "height must be a positive number");

  assert(typeof profile.fps === "number" && profile.fps > 0,
    "fps must be a positive number");

  assert(typeof profile.outputFile === "string" && profile.outputFile.length > 0,
    "outputFile must be a non-empty string");

  if (profile.videoBitrate) {
    assert(typeof profile.videoBitrate === "string",
      "videoBitrate must be a string (e.g. 4500k)");
  }

  if (profile.audioBitrate) {
    assert(typeof profile.audioBitrate === "string",
      "audioBitrate must be a string (e.g. 192k)");
  }

  if (profile.preset) {
    assert(typeof profile.preset === "string",
      "preset must be a string (e.g. medium, fast)");
  }

  return true;
};
