"use client";

import { useState } from "react";

type Step = 1 | 2 | 3 | 4;
type InputMethod = "url" | "upload" | null;
type Format = "landscape" | "vertical" | null;

export default function CreatePage() {
  const [step, setStep] = useState<Step>(1);
  const [inputMethod, setInputMethod] = useState<InputMethod>(null);
  const [format, setFormat] = useState<Format>(null);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <div className="h-7 w-7 rounded-md bg-teal-500 text-white flex items-center justify-center text-sm">
              ▶
            </div>
            YourBrand
          </div>

          <span className="text-sm text-slate-500">
            Step {step} of 4
          </span>
        </div>
      </header>

      {/* Content */}
      <section className="w-full max-w-md px-6 py-20">
        {/* Step title */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 && "How would you like to add your listing?"}
            {step === 2 &&
              (inputMethod === "url"
                ? "Paste your listing URL"
                : "Upload your photos")}
            {step === 3 && "Choose video format"}
            {step === 4 && "Ready to render your video"}
          </h1>

          <p className="mt-2 text-slate-600 text-sm">
            {step === 1 && "Choose one option to continue"}
            {step === 2 && "This will be used to generate your video"}
            {step === 3 && "Select where you’ll share this video"}
            {step === 4 && "We’ll take care of everything"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white border shadow-sm p-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <OptionCard
                title="Use listing URL"
                description="Paste a property listing link"
                onClick={() => {
                  setInputMethod("url");
                  setStep(2);
                }}
              />

              <OptionCard
                title="Upload photos manually"
                description="Upload images from your computer"
                onClick={() => {
                  setInputMethod("upload");
                  setStep(2);
                }}
              />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              {inputMethod === "url" && (
                <input
                  type="text"
                  placeholder="https://example.com/listing"
                  className="w-full rounded-xl border px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              )}

              {inputMethod === "upload" && (
                <div className="rounded-xl border-2 border-dashed p-10 text-center text-slate-500">
                  Drag & drop images here or click to upload
                </div>
              )}

              <button
                onClick={() => setStep(3)}
                className="mt-6 w-full rounded-xl bg-teal-500 py-4 text-white font-semibold hover:bg-teal-600 transition"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <OptionCard
                title="Landscape"
                description="YouTube, websites"
                selected={format === "landscape"}
                onClick={() => {
                  setFormat("landscape");
                  setStep(4);
                }}
              />

              <OptionCard
                title="Vertical"
                description="Instagram, Reels, Shorts"
                selected={format === "vertical"}
                onClick={() => {
                  setFormat("vertical");
                  setStep(4);
                }}
              />
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <button
              className="w-full rounded-xl bg-teal-500 py-4 text-white font-semibold hover:bg-teal-600 transition"
            >
              Render video
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full ${
                step >= s ? "bg-teal-500" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

/* ---------- Components ---------- */

function OptionCard({
  title,
  description,
  onClick,
  selected = false,
}: {
  title: string;
  description: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-5 text-left transition
        ${
          selected
            ? "border-teal-500 bg-teal-50"
            : "hover:border-teal-400"
        }
      `}
    >
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </button>
  );
}
