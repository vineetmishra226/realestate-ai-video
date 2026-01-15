import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#F2FFFF] text-slate-900">
      {/* ===================== HEADER ===================== */}
      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
            ▶
          </div>
          YourBrand
        </div>

        <div className="flex items-center gap-6">
          <a className="text-sm text-slate-600 hover:text-slate-900" href="#">
            Login
          </a>
          <a
            href="/create"
            className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-600 transition"
          >
            Start for free →
          </a>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="mx-auto max-w-5xl px-6 pt-20 text-center">
        <span className="inline-block rounded-full bg-teal-100 px-4 py-1 text-xs font-medium text-teal-700">
          #1 REAL ESTATE AI VIDEO PLATFORM
        </span>

        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          Create Stunning Property Videos{" "}
          <span className="text-teal-500">Instantly</span> with AI
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Create professional real estate videos 100× faster using just photos.
          Trusted by agents and media professionals.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/create"
            className="rounded-xl bg-teal-500 px-8 py-4 text-base font-semibold text-white hover:bg-teal-600 transition"
          >
            Start for free →
          </a>
          <p className="text-sm text-slate-500">
            No credit card required
          </p>
        </div>

        {/* Social proof */}
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-600">
          <div className="flex -space-x-2">
            <div className="h-7 w-7 rounded-full bg-slate-300" />
            <div className="h-7 w-7 rounded-full bg-slate-400" />
            <div className="h-7 w-7 rounded-full bg-slate-500" />
          </div>
          <span>4.9 ★★★★★ from real estate professionals</span>
        </div>
      </section>

      {/* ===================== BEFORE / AFTER ===================== */}
      <section className="mt-24 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Turn listing photos into videos
            </h2>
            <span className="text-sm text-slate-500">
              Before → After
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* BEFORE */}
            <div className="rounded-xl overflow-hidden bg-slate-100">
              <Image
                src="/placeholder-before.jpg"
                alt="Before"
                width={400}
                height={300}
                className="object-cover"
              />
            </div>

            {/* AFTER */}
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center text-white text-sm">
              Video
            </div>

            {/* BEFORE */}
            <div className="rounded-xl overflow-hidden bg-slate-100">
              <Image
                src="/placeholder-before.jpg"
                alt="Before"
                width={400}
                height={300}
                className="object-cover"
              />
            </div>

            {/* AFTER */}
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center text-white text-sm">
              Video
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="bg-[#F2FFFF] py-20">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-semibold text-lg">
              Add your listing
            </h3>
            <p className="mt-2 text-slate-600 text-sm">
              Paste a listing URL or upload photos.
            </p>
          </div>

          <div>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-semibold text-lg">
              Choose a style
            </h3>
            <p className="mt-2 text-slate-600 text-sm">
              Select format and quality in one click.
            </p>
          </div>

          <div>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-semibold text-lg">
              Render & download
            </h3>
            <p className="mt-2 text-slate-600 text-sm">
              Your video is ready in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-white py-10 text-center text-sm text-slate-500">
        © YourBrand
      </footer>
    </main>
  );
}
