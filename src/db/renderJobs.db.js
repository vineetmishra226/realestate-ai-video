const db = require("./index");

/* ---------- INIT ---------- */

db.prepare(`
  CREATE TABLE IF NOT EXISTS render_jobs (
    jobId TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    status TEXT NOT NULL,
    progress INTEGER NOT NULL,
    payload TEXT,
    outputVideo TEXT,
    error TEXT,
    createdAt TEXT NOT NULL
  )
`).run();

/* ---------- HELPERS ---------- */

function createJob(job) {
  db.prepare(`
    INSERT INTO render_jobs (
      jobId,
      projectId,
      status,
      progress,
      payload,
      outputVideo,
      error,
      createdAt
    ) VALUES (
      @jobId,
      @projectId,
      @status,
      @progress,
      @payload,
      @outputVideo,
      @error,
      @createdAt
    )
  `).run({
    ...job,
    payload: JSON.stringify(job.payload || {}),
  });

  return job;
}

function updateJob(jobId, updates) {
  const fields = Object.keys(updates)
    .map(key => `${key} = @${key}`)
    .join(", ");

  db.prepare(`
    UPDATE render_jobs
    SET ${fields}
    WHERE jobId = @jobId
  `).run({
    jobId,
    ...updates,
    payload: updates.payload
      ? JSON.stringify(updates.payload)
      : undefined,
  });
}

function getJob(jobId) {
  const row = db
    .prepare(`SELECT * FROM render_jobs WHERE jobId = ?`)
    .get(jobId);

  if (!row) return null;

  return {
    ...row,
    payload: JSON.parse(row.payload || "{}"),
  };
}

function listJobs(projectId) {
  return db
    .prepare(
      `SELECT * FROM render_jobs WHERE projectId = ? ORDER BY createdAt DESC`
    )
    .all(projectId)
    .map(row => ({
      ...row,
      payload: JSON.parse(row.payload || "{}"),
    }));
}

module.exports = {
  createJob,
  updateJob,
  getJob,
  listJobs,
};
