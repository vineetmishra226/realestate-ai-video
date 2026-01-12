const fs = require("fs");
const path = require("path");

const PREVIEW_PATH = path.join(
  __dirname,
  "../../preview/agent-preview.json"
);

/* =========================
   Helpers
========================= */
function loadPreview() {
  if (!fs.existsSync(PREVIEW_PATH)) {
    throw new Error("agent-preview.json not found");
  }

  return JSON.parse(fs.readFileSync(PREVIEW_PATH, "utf-8"));
}

function savePreview(preview) {
  preview.metadata.updatedAt = new Date().toISOString();
  fs.writeFileSync(
    PREVIEW_PATH,
    JSON.stringify(preview, null, 2)
  );
}

/* =========================
   Image Controls
========================= */
function enableImage(imageId) {
  const preview = loadPreview();

  const img = preview.media.images.find(i => i.id === imageId);
  if (!img) throw new Error(`Image not found: ${imageId}`);

  img.enabled = true;
  savePreview(preview);
}

function disableImage(imageId) {
  const preview = loadPreview();

  const img = preview.media.images.find(i => i.id === imageId);
  if (!img) throw new Error(`Image not found: ${imageId}`);

  img.enabled = false;
  savePreview(preview);
}

function reorderImages(imageOrder) {
  const preview = loadPreview();

  imageOrder.forEach((id, index) => {
    const img = preview.media.images.find(i => i.id === id);
    if (!img) throw new Error(`Image not found: ${id}`);
    img.order = index + 1;
  });

  savePreview(preview);
}

/* =========================
   Video Controls
========================= */
function setVideoProfile(profile) {
  const preview = loadPreview();
  preview.media.videoProfile = profile;
  savePreview(preview);
}

function setQualityPreset(preset) {
  const preview = loadPreview();
  preview.media.qualityPreset = preset;
  savePreview(preview);
}

/* =========================
   Audio Controls
========================= */
function toggleAudio(enabled) {
  const preview = loadPreview();
  preview.audio.enabled = enabled;
  savePreview(preview);
}

function setVoice(voice) {
  const preview = loadPreview();
  preview.audio.voice = voice;
  savePreview(preview);
}

/* =========================
   Public API
========================= */
module.exports = {
  enableImage,
  disableImage,
  reorderImages,
  setVideoProfile,
  setQualityPreset,
  toggleAudio,
  setVoice
};
