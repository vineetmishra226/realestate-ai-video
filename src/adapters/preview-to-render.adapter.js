const fs = require("fs");
const path = require("path");
const renderPlanSchema = require("../video/render-plan.schema");

const PREVIEW_PATH = path.join(
  __dirname,
  "../../preview/agent-preview.json"
);

const AUDIO_PATH = path.join(
  __dirname,
  "../../assets/voiceover.wav"
);

function buildRenderPlan() {
  if (!fs.existsSync(PREVIEW_PATH)) {
    throw new Error("agent-preview.json not found");
  }

  const preview = JSON.parse(fs.readFileSync(PREVIEW_PATH, "utf-8"));
  const plan = JSON.parse(JSON.stringify(renderPlanSchema));

  /* ---------------------
     Video profile
  --------------------- */
  plan.video.profile = preview.media.videoProfile;

  /* ---------------------
     Images (enabled only)
  --------------------- */
  plan.images = preview.media.images
    .filter(img => img.enabled)
    .sort((a, b) => a.order - b.order)
    .map(img => ({
      path: img.path,
      order: img.order
    }));

  if (plan.images.length === 0) {
    throw new Error("No enabled images to render");
  }

  /* ---------------------
     Audio
  --------------------- */
  plan.audio.enabled = preview.audio.enabled;
  plan.audio.path = AUDIO_PATH;

  /* ---------------------
     Output
  --------------------- */
  plan.output.filename = preview.output?.filename || "final-video.mp4";

  return plan;
}

module.exports = { buildRenderPlan };
