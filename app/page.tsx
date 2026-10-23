"use client";

import { useState } from "react";
import Coach from "@/components/Coach";
import MealPlanner from "@/components/MealPlanner";
import SnapTracker from "@/components/SnapTracker";
import { CameraIcon, ChatIcon, PlateIcon } from "@/components/icons";
import { Disclaimer } from "@/components/ui";

const TABS = [
  {
    id: "snap",
    label: "Snap Tracker",
    Icon: CameraIcon,
    subtitle: "Photo → calories, carbs & glycemic impact",
  },
  {
    id: "plan",
    label: "Meal Planner",
    Icon: PlateIcon,
    subtitle: "A steady-sugar plan for your day",
  },
  {
    id: "coach",
    label: "AI Coach",
    Icon: ChatIcon,
    subtitle: "Ask in English, اردو, or سنڌي",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Logo() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
        <path d="M3 12h4l2-5 3 10 2.5-7 1.5 2h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<TabId>("snap");
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <Logo />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Nutri<span className="text-teal-700">Care</span>
            </h1>
            <p className="text-xs font-medium text-slate-500">
              AI Metabolic Health Companion
            </p>
          </div>
          <span className="ml-auto hidden rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 sm:inline">
            No login needed
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-2xl border p-4 text-left transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                tab === t.id
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:border-teal-300"
              }`}
            >
              <t.Icon className="h-7 w-7" aria-hidden />
              <p className="mt-1 text-base font-bold">{t.label}</p>
              <p className={`mt-0.5 text-xs ${tab === t.id ? "text-teal-100" : "text-slate-500"}`}>
                {t.subtitle}
              </p>
            </button>
          ))}
        </div>

        <section className="mt-6">
          <h2 className="sr-only">{active.label}</h2>
          {tab === "snap" ? <SnapTracker /> : null}
          {tab === "plan" ? <MealPlanner /> : null}
          {tab === "coach" ? <Coach /> : null}
        </section>
      </main>

      <Disclaimer />
    </div>
  );
}
