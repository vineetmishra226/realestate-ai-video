const express = require("express");
const path = require("path");
const fs = require("fs");

const { buildRenderPlan } = require("../../src/video/render-plan");
const { renderFrameBasedVideo } = require("../../src/frame-engine/render-frame-video");
const {
  createJob,
  updateJob,
  getJob,
  listJobs,
} = require("../../src/render/render.jobs");

const router = express.Router();

router.post("/job", async (req, res) => {
  try {
    const {
      images,
      profile = "landscape",
      preset = "high",
      projectId = "demo",
    } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, error: "No images provided" });
    }

    const job = createJob({ images, profile, preset, projectId });
    res.json({ success: true, jobId: job.jobId });

    console.log("🚀 RENDER ROUTE HIT", images);

    setImmediate(async () => {
      try {
        updateJob(job.jobId, { status: "rendering", progress: 5 });

        const outputDir = path.join(
          process.cwd(),
          "uploads",
          "projects",
          projectId,
          "videos"
        );
        fs.mkdirSync(outputDir, { recursive: true });

        const renderPlan = buildRenderPlan({ profile, preset, outputDir });

        const finalOutputPath = path.join(
          outputDir,
          `${job.jobId}.mp4`
        ).replace(/\\/g, "/");

        console.log(`🎥 Starting PHASE 13 continuous render`);

        await renderFrameBasedVideo({
          imagePaths: images.map(img => path.join(process.cwd(), img)),
          outputPath: finalOutputPath,
          width: Math.floor(renderPlan.video.width),
          height: Math.floor(renderPlan.video.height),
          fps: renderPlan.video.fps,
          secondsPerImage: 6,
          oversample: 2,
        });

        updateJob(job.jobId, {
          status: "completed",
          progress: 100,
          outputVideo: `/uploads/projects/${projectId}/videos/${path.basename(finalOutputPath)}`,
        });
      } catch (err) {
        console.error("❌ Render failed:", err);
        updateJob(job.jobId, { status: "failed", error: err.message });
      }
    });
  } catch (err) {
    console.error("Render route error:", err);
    res.status(500).json({ success: false });
  }
});

router.get("/job/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ success: false });
  res.json({ success: true, job });
});

router.get("/jobs", (req, res) => {
  const { projectId = "demo" } = req.query;
  res.json({ success: true, jobs: listJobs(projectId) });
});

module.exports = router;
