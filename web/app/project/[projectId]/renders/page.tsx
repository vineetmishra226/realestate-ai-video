"use client";

import { useEffect, useState, use } from "react";

/* ---------------- Types ---------------- */

type RenderJob = {
  jobId: string;
  status: "pending" | "rendering" | "completed" | "failed";
  progress: number;
  createdAt: string;
  outputVideo?: string;
  error?: string | null;
};

/* ---------------- Page ---------------- */

export default function RenderQueuePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  // ✅ REQUIRED for Next.js 15+ / 16
  const { projectId } = use(params);

  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_BASE = "http://localhost:4000";

  async function fetchJobs() {
    try {
      const res = await fetch(
        `${BACKEND_BASE}/api/render/jobs?projectId=${projectId}`
      );
      const data = await res.json();

      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error("Failed to fetch render jobs", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-2xl font-semibold text-slate-800">
        Render Queue
      </h1>

      <p className="text-sm text-slate-500 mb-6">
        Project ID: <strong>{projectId}</strong>
      </p>

      {loading && (
        <p className="text-slate-500">Loading render jobs…</p>
      )}

      {!loading && jobs.length === 0 && (
        <p className="text-slate-500">
          No renders yet. Go back and start a render.
        </p>
      )}

      <div className="space-y-4">
        {jobs.map(job => (
          <div
            key={job.jobId}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400">Job ID</p>
                <p className="text-sm font-medium text-slate-700">
                  {job.jobId}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  job.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : job.status === "rendering"
                    ? "bg-yellow-100 text-yellow-700"
                    : job.status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {job.status}
              </span>
            </div>

            <div className="mt-3">
              <div className="h-2 bg-slate-200 rounded overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {job.progress}% complete
              </p>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Created: {new Date(job.createdAt).toLocaleString()}
            </p>

            {job.status === "completed" && job.outputVideo && (
              <a
                href={`/project/${projectId}/renders/${job.jobId}`}
                className="inline-block mt-3 text-sm text-teal-600 hover:underline"
              >
                Open playback
              </a>
            )}

            {job.status === "failed" && job.error && (
              <p className="mt-3 text-sm text-red-600">
                Error: {job.error}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
