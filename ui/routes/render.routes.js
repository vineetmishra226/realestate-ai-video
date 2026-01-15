const express = require("express");
const path = require("path");

const renderVideo = require("../../src/pipelines/video.pipeline");
const { buildRenderPlan } = require("../../src/video/video-pipeline");

const {
  createJob,
  updateJob,
  getJob,
} = require("../../src/render/render.jobs");

const router = express.Router();

/**
 * Legacy endpoint (unchanged)
 */
router.post("/", async (req, res) => {
  return res.json({
    success: true,
    message:
      "Legacy render endpoint still exists. Use /render/job instead.",
  });
});

/**
 * Create and run render job
 * POST /api/render/job
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

    // Create job
    const job = createJob({
      images,
      profile,
      preset,
      projectId,
    });

    // Respond immediately
    res.json({
      success: true,
      jobId: job.jobId,
    });

    // Run render async
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
            return (
              Array.isArray(this.images) &&
              this.images.length > 0
            );
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

        // Force job-based filename
        renderPlan.output.filename = `${job.jobId}.mp4`;
        renderPlan.output.path = path.join(
          outputDir,
          renderPlan.output.filename
        );

        const outputPath = await renderVideo(
          listing,
          renderPlan,
          percent => {
            updateJob(job.jobId, {
              progress: percent,
            });
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
    return res.status(500).json({
      success: false,
      error: "Failed to create render job",
    });
  }
});

/**
 * Get render job status
 * GET /api/render/job/:jobId
 */
router.get("/job/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: "Job not found",
    });
  }

  return res.json({
    success: true,
    job,
  });
});

module.exports = router;
