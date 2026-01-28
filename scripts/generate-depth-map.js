const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Usage:
 *   node scripts/generate-depth-map.js <path-to-image>
 *
 * Example:
 *   node scripts/generate-depth-map.js uploads/projects/demo/1768623491929-457119769.jpg
 */

// ---------- INPUT VALIDATION ----------
const inputImage = process.argv[2];

if (!inputImage) {
  console.error("❌ ERROR: No image path provided");
  console.error("Usage: node scripts/generate-depth-map.js <path-to-image>");
  process.exit(1);
}

const imagePath = path.resolve(inputImage);

if (!fs.existsSync(imagePath)) {
  console.error("❌ ERROR: Image does not exist:", imagePath);
  process.exit(1);
}

// ---------- OUTPUT ----------
const imageDir = path.dirname(imagePath);
const imageBase = path.basename(imagePath, path.extname(imagePath));
const depthOut = path.join(imageDir, `${imageBase}.depth.png`);

// ---------- PYTHON SCRIPT ----------
const pythonScript = `
import torch
import cv2
import numpy as np
import torch.hub

# ===============================
# OPTION A — DPT_Large (HIGH QUALITY)
# ===============================
model_type = "DPT_Large"

print("▶ Loading MiDaS model:", model_type)
midas = torch.hub.load("intel-isl/MiDaS", model_type, trust_repo=True)
midas.eval()

transforms = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)
transform = transforms.dpt_transform  # CRITICAL CHANGE

# Load image
img = cv2.imread(r"${imagePath}")
if img is None:
    raise RuntimeError("Failed to load image")

img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# Prepare input
input_batch = transform(img)

# Inference
with torch.no_grad():
    prediction = midas(input_batch)

# Resize depth to original resolution
prediction = torch.nn.functional.interpolate(
    prediction.unsqueeze(1),
    size=img.shape[:2],
    mode="bicubic",
    align_corners=False,
).squeeze()

depth = prediction.cpu().numpy()

# Normalize for visualization (IMPORTANT)
depth = (depth - depth.min()) / (depth.max() - depth.min())
depth = (depth * 255).astype(np.uint8)

# Save depth map
cv2.imwrite(r"${depthOut}", depth)

print("✅ Depth map saved:", r"${depthOut}")
`;

// ---------- RUN ----------
const tmpPy = path.join(__dirname, "_tmp_depth.py");
fs.writeFileSync(tmpPy, pythonScript);

console.log("▶ Generating depth map using DPT_Large for:");
console.log("  ", imagePath);

execSync(`python "${tmpPy}"`, { stdio: "inherit" });

fs.unlinkSync(tmpPy);
