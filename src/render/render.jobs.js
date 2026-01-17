const {
  createJob: dbCreateJob,
  updateJob: dbUpdateJob,
  getJob: dbGetJob,
  listJobs: dbListJobs,
} = require("../db/renderJobs.db");

/* ---------- API ---------- */

function createJob({ images, profile, preset, projectId }) {
  const job = {
    jobId: `render_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    projectId,
    status: "pending",
    progress: 0,
    payload: {
      images,
      profile,
      preset,
      projectId,
    },
    outputVideo: null,
    error: null,
    createdAt: new Date().toISOString(),
  };

  dbCreateJob(job);
  return job;
}

function updateJob(jobId, updates) {
  dbUpdateJob(jobId, updates);
}

function getJob(jobId) {
  return dbGetJob(jobId);
}

function listJobs(projectId) {
  return dbListJobs(projectId);
}

module.exports = {
  createJob,
  updateJob,
  getJob,
  listJobs,
};
