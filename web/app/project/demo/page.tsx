"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ---------------- Types ---------------- */

type Tab = "images" | "settings" | "render";
type RenderState = "idle" | "rendering" | "completed" | "failed";

type ImageItem = {
  id: string;
  url: string;
};

/* ---------------- Page ---------------- */

export default function ProjectDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("images");
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [renderState, setRenderState] = useState<RenderState>("idle");
  const [progress, setProgress] = useState(0);
  const [renderedVideo, setRenderedVideo] = useState<string | null>(null);

  const BACKEND_BASE = "http://localhost:4000";

  /* ---------- Upload ---------- */

  async function handleFiles(files: FileList | null) {
    if (!files) return;

    const formData = new FormData();
    formData.append("projectId", "demo");

    Array.from(files).forEach(file => {
      formData.append("images", file);
    });

    const response = await fetch(
      `${BACKEND_BASE}/api/upload-images`,
      { method: "POST", body: formData }
    );

    const result = await response.json();

    if (!result.success) {
      alert("Upload failed");
      return;
    }

    const uploadedImages: ImageItem[] = result.images.map(
      (img: any) => ({
        id: crypto.randomUUID(),
        url: `${BACKEND_BASE}${img.path}`,
      })
    );

    setSelectedImages(prev => [...prev, ...uploadedImages]);
  }

  function removeImage(img: ImageItem) {
    setSelectedImages(prev => prev.filter(i => i.id !== img.id));
  }

  /* ---------- Drag ---------- */

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSelectedImages(items => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  /* ---------- Render ---------- */

  async function startRender() {
    setActiveTab("render");
    setRenderState("rendering");
    setProgress(0);
    setRenderedVideo(null);

    const response = await fetch(
      `${BACKEND_BASE}/api/render/job`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "demo",
          profile: "landscape",
          preset: "high",
          images: selectedImages.map(img =>
            img.url.replace(BACKEND_BASE, "")
          ),
        }),
      }
    );

    const result = await response.json();
    pollJob(result.jobId);
  }

  function pollJob(jobId: string) {
    const timer = setInterval(async () => {
      const res = await fetch(
        `${BACKEND_BASE}/api/render/job/${jobId}`
      );
      const data = await res.json();

      if (!data.success) return;

      setProgress(data.job.progress || 0);

      if (data.job.status === "completed") {
        clearInterval(timer);
        setRenderState("completed");
        setRenderedVideo(
          `${BACKEND_BASE}${data.job.outputVideo}`
        );
      }

      if (data.job.status === "failed") {
        clearInterval(timer);
        setRenderState("failed");
      }
    }, 1000);
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="h-14 bg-white border-b flex items-center justify-between px-6">
        <span className="font-semibold text-slate-800">
          Demo Property Video
        </span>

        <button
          onClick={startRender}
          disabled={
            renderState === "rendering" ||
            selectedImages.length === 0
          }
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
            renderState === "rendering" ||
            selectedImages.length === 0
              ? "bg-slate-400"
              : "bg-teal-500 hover:bg-teal-600"
          }`}
        >
          Render video
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-r p-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => handleFiles(e.target.files)}
          />
        </aside>

        <section className="flex-1 p-8">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedImages.map(i => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-4 gap-6">
                {selectedImages.map((img, index) => (
                  <SortableImage
                    key={img.id}
                    img={img}
                    index={index}
                    onRemove={removeImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {renderState === "rendering" && (
            <div className="mt-6">
              <div className="h-2 bg-slate-200 rounded overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {renderedVideo && (
            <video
              src={renderedVideo}
              controls
              className="mt-6 w-full rounded-xl"
            />
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------------- Sortable Image ---------------- */

function SortableImage({
  img,
  index,
  onRemove,
}: {
  img: ImageItem;
  index: number;
  onRemove: (img: ImageItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: img.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="relative rounded-xl bg-white border shadow-sm overflow-hidden"
    >
      <span className="absolute top-3 left-3 z-10 h-7 w-7 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center">
        {index + 1}
      </span>

      <button
        onClick={() => onRemove(img)}
        className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-white shadow text-slate-400 hover:text-red-500"
      >
        ✕
      </button>

      <img
        src={img.url}
        className="h-48 w-full object-cover"
      />

      <div
        {...attributes}
        {...listeners}
        className="cursor-grab bg-slate-50 text-xs text-center py-2 text-slate-500"
      >
        Drag to reorder
      </div>
    </div>
  );
}
