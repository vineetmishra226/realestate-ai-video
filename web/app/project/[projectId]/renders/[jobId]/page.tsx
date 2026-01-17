"use client";

import { useEffect, useState, use } from "react";

type RenderJob = {
  jobId: string;
  status: "pending" | "rendering" | "completed" | "failed";
  progress: number;
  outputVideo?: string;
  error?: string | null;
};

export default function RenderPlaybackPage({
  params,
}: {
  params: Promise<{ projectId: string; jobId: string }>;
}) {
  // Required for Next.js 15+
  const { projectId, jobId } = use(params);

  const [job, setJob] = useState<RenderJob | null>(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_BASE = "http://localhost:4000";

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(
          `${BACKEND_BASE}/api/render/job/${jobId}`
        );
        const data = await res.json();

        if (data.success) {
          setJob(data.job);
        }
      } catch (err) {
        console.error("Failed to fetch job", err);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading render…
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-red-600">
        Render job not found.
      </div>
    );
  }

  if (job.status !== "completed") {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-slate-800">
          Render not completed
        </h1>
        <p className="text-slate-500 mt-2">
          Status: {job.status}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <h1 className="text-white text-lg mb-4">
        Render Playback
      </h1>

      {job.outputVideo && (
        <video
          src={`${BACKEND_BASE}${job.outputVideo}`}
          controls
          autoPlay
          className="max-w-4xl w-full rounded-lg shadow-lg"
        />
      )}

      <a
        href={`/project/${projectId}/renders`}
        className="mt-6 text-sm text-teal-400 hover:underline"
      >
        ← Back to render queue
      </a>
    </div>
  );
}
