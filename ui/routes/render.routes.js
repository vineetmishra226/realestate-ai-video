const express = require("express");
const path = require("path");

const renderVideo = require("../../src/video/video-pipeline");
const { buildRenderPlan } = require("../../src/video/render-plan");

const {
  createJob,
  updateJob,
  getJob,
  listJobs,
} = require("../../src/render/render.jobs");

const router = express.Router();

/**
 * Legacy endpoint
 */
router.post("/", (_req, res) => {
  res.json({
    success: true,
    message: "Use /api/render/job instead",
  });
});

/**
 * Create render job
 */
router.post("/job", async (req, res) => {
  try {
    const {
      images,
      profile = "landscape",
      preset = "high",
      projectId = "demo",
    } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No images provided",
      });
    }

    const job = createJob({
      images,
      profile,
      preset,
      projectId,
    });

    res.json({
      success: true,
      jobId: job.jobId,
    });

    setImmediate(async () => {
      try {
        updateJob(job.jobId, {
          status: "rendering",
          progress: 5,
        });

        const listing = {
          images: images.map(img =>
            path.join(process.cwd(), img)
          ),
          isValid() {
            return this.images.length > 0;
          },
        };

        const outputDir = path.join(
          process.cwd(),
          "uploads",
          "projects",
          projectId,
          "videos"
        );

        const renderPlan = buildRenderPlan({
          profile,
          preset,
          outputDir,
        });

        renderPlan.output.filename = `${job.jobId}.mp4`;
        renderPlan.output.path = path.join(
          outputDir,
          renderPlan.output.filename
        );

        const outputPath = await renderVideo(
          listing,
          renderPlan,
          percent => {
            updateJob(job.jobId, { progress: percent });
          }
        );

        updateJob(job.jobId, {
          status: "completed",
          progress: 100,
          outputVideo: `/uploads/projects/${projectId}/videos/${path.basename(
            outputPath
          )}`,
        });
      } catch (err) {
        console.error("Render failed:", err);

        updateJob(job.jobId, {
          status: "failed",
          error: err.message,
        });
      }
    });
  } catch (err) {
    console.error("Render job error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create render job",
    });
  }
});

/**
 * Get job
 */
router.get("/job/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: "Job not found",
    });
  }
  res.json({ success: true, job });
});

/**
 * List jobs
 */
router.get("/jobs", (req, res) => {
  const { projectId = "demo" } = req.query;
  res.json({
    success: true,
    jobs: listJobs(projectId),
  });
});

module.exports = router;
