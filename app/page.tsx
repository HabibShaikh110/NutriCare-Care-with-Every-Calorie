import Link from "next/link";
import { CameraIcon, ChatIcon, PlateIcon } from "@/components/icons";
import { DISCLAIMER } from "@/lib/types";

function PulseMark() {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-10 w-auto"
      aria-hidden
    >
      <path d="M2 20h22l7-14 10 28 8-22 6 12h15" />
    </svg>
  );
}

const FEATURES = [
  {
    Icon: CameraIcon,
    title: "Snap a meal",
    sub: "Photo → calories, carbs, glycemic score",
  },
  {
    Icon: PlateIcon,
    title: "Desi meal plans",
    sub: "Daal, roti, karahi — steady-sugar days",
  },
  {
    Icon: ChatIcon,
    title: "AI Coach",
    sub: "Answers in English, اردو & سنڌي",
  },
] as const;

export default function Landing() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(13,148,136,0.14),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 text-teal-600/[0.07]"
      >
        <svg viewBox="0 0 400 120" fill="none" stroke="currentColor" strokeWidth="3" className="w-[min(760px,140vw)]">
          <path d="M0 60h120l24-44 32 88 26-70 20 40h180" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-5 sm:px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path d="M3 12h4l2-5 3 10 2.5-7 1.5 2h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-xl font-extrabold tracking-tight text-slate-900">
            Nutri<span className="text-teal-700">Care</span>
          </p>
          <p className="text-xs font-medium text-slate-500">Care with Every Calorie</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-16 pt-6 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-teal-800">
          <span className="text-teal-600"><PulseMark /></span>
          AI Metabolic Health Companion
        </span>

        <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
          Care with every <span className="text-teal-700">calorie</span>.
        </h1>

        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          Snap a plate, get instant carbs &amp; a color-coded glycemic score, and ask a
          friendly AI coach anything — in <strong className="font-semibold text-slate-800">English</strong>,{" "}
          <strong className="font-semibold text-slate-800">اردو</strong> &amp;{" "}
          <strong className="font-semibold text-slate-800">سنڌي</strong>. Made for every
          Pakistani home.
        </p>

        <Link
          href="/app"
          className="group mt-9 inline-flex items-center gap-3 rounded-full bg-teal-700 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-teal-700/25 transition hover:bg-teal-800 hover:shadow-teal-700/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Get Started — It&apos;s Free
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-5 w-5 transition group-hover:translate-x-0.5" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p className="mt-4 text-sm font-medium text-slate-500">
          No login · No hassle · Works on any phone
        </p>

        <div className="mt-14 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm backdrop-blur sm:flex-col sm:items-start sm:text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <f.Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{f.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-200/80 bg-white/70 backdrop-blur">
        <p className="mx-auto max-w-3xl px-4 py-4 text-center text-xs leading-5 text-slate-500 sm:px-6">
          <span className="font-semibold text-slate-600">Medical disclaimer:</span>{" "}
          {DISCLAIMER}
        </p>
      </footer>
    </div>
  );
}
