/**
 * In-memory render job registry
 * NOTE: This is intentionally simple for now.
 * In later phases this can be replaced with Redis / DB.
 */

const jobs = new Map();

/**
 * Create a new render job
 */
function createJob(payload) {
  const jobId = `render_${Date.now()}_${Math.floor(
    Math.random() * 10000
  )}`;

  const job = {
    jobId,
    status: "queued", // queued | rendering | completed | failed
    progress: 0,
    payload,
    outputVideo: null,
    error: null,
    createdAt: new Date().toISOString(),
  };

  jobs.set(jobId, job);
  return job;
}

/**
 * Update job fields
 */
function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (!job) return null;

  Object.assign(job, updates);
  return job;
}

/**
 * Get job by id
 */
function getJob(jobId) {
  return jobs.get(jobId) || null;
}

module.exports = {
  createJob,
  updateJob,
  getJob,
};
