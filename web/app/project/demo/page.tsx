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
type RenderState = "idle" | "rendering" | "completed";

type ImageItem = {
  id: string;
  url: string; // served by backend (/uploads/...)
};

/* ---------------- Page ---------------- */

export default function ProjectDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("images");
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [renderState, setRenderState] = useState<RenderState>("idle");
  const [progress, setProgress] = useState(0);

  const BACKEND_BASE = "http://localhost:3000";

  /* ---------- Upload to backend ---------- */

  async function handleFiles(files: FileList | null) {
    if (!files) return;

    const formData = new FormData();
    formData.append("projectId", "demo");

    Array.from(files).forEach(file => {
      formData.append("images", file);
    });

    const response = await fetch(
      `${BACKEND_BASE}/api/upload-images`,
      {
        method: "POST",
        body: formData,
      }
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

  /* ---------- Drag & Drop ---------- */

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSelectedImages(items => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  /* ---------- Fake Render Progress (unchanged) ---------- */

  useEffect(() => {
    if (renderState !== "rendering") return;

    setProgress(0);
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setRenderState("completed");
          return 100;
        }
        return p + 10;
      });
    }, 400);

    return () => clearInterval(timer);
  }, [renderState]);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-teal-500 text-white flex items-center justify-center text-sm">
            ▶
          </div>
          <span className="font-semibold text-slate-800">
            Demo Property Video
          </span>
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
            {renderState === "completed" ? "Completed" : "Draft"}
          </span>
        </div>

        <button
          onClick={() => {
            setActiveTab("render");
            setRenderState("rendering");
          }}
          disabled={renderState === "rendering" || selectedImages.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
            renderState === "rendering" || selectedImages.length === 0
              ? "bg-slate-400"
              : "bg-teal-500 hover:bg-teal-600"
          }`}
        >
          Render video
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">Upload images</h2>
            <p className="text-xs text-slate-500">
              JPG or PNG recommended
            </p>
          </div>

          <div className="p-4">
            <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-teal-400">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
              <p className="text-sm font-medium text-slate-600">
                Click to upload
              </p>
              <p className="text-xs text-slate-400 mt-1">
                or drag & drop
              </p>
            </label>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="bg-white border-b px-6">
            <nav className="flex gap-6">
              <Tab label="Images" active={activeTab === "images"} onClick={() => setActiveTab("images")} />
              <Tab label="Video settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
              <Tab label="Preview & render" active={activeTab === "render"} onClick={() => setActiveTab("render")} />
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "images" && (
              <ImagesTab
                images={selectedImages}
                onDragEnd={handleDragEnd}
                onRemove={removeImage}
              />
            )}

            {activeTab === "render" && (
              <RenderTab
                images={selectedImages}
                state={renderState}
                progress={progress}
              />
            )}

            {activeTab === "settings" && (
              <p className="text-slate-500">
                Video settings coming next…
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------- Images Tab ---------------- */

function ImagesTab({
  images,
  onDragEnd,
  onRemove,
}: {
  images: ImageItem[];
  onDragEnd: (e: DragEndEvent) => void;
  onRemove: (img: ImageItem) => void;
}) {
  return (
    <>
      <h1 className="text-xl font-semibold text-slate-800">
        Images in your video
      </h1>
      <p className="text-sm text-slate-500">
        Drag to reorder. First image plays first.
      </p>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={images.map(i => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="mt-6 grid grid-cols-4 gap-6">
            {images.map((img, index) => (
              <SortableImage
                key={img.id}
                img={img}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}

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

      <div className="h-48 bg-black">
        <img
          src={img.url}
          alt="Preview"
          className="h-full w-full object-cover"
        />
      </div>

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

/* ---------------- Render Tab ---------------- */

function RenderTab({
  images,
  state,
  progress,
}: {
  images: ImageItem[];
  state: RenderState;
  progress: number;
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-800">
        Live preview
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        Review before rendering
      </p>

      <div className="rounded-xl border bg-white p-6">
        Preview slideshow ({images.length} images)
      </div>

      {state === "rendering" && (
        <div className="mt-6">
          <div className="h-2 bg-slate-200 rounded overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {state === "completed" && (
        <p className="mt-6 text-teal-600 font-medium">
          ✓ Video rendered successfully
        </p>
      )}
    </div>
  );
}

/* ---------------- UI ---------------- */

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-4 text-sm font-medium border-b-2 ${
        active
          ? "border-teal-500 text-teal-600"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}
