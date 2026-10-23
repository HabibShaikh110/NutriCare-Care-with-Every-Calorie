"use client";

import { useState } from "react";
import type { MealPlan } from "@/lib/types";
import { ErrorBanner, LoadingButton, MetricCard } from "./ui";

const DIETS = ["Vegetarian", "Keto", "Balanced"] as const;
const GOALS = [
  "Lower fasting blood sugar",
  "Steady blood sugar throughout the day",
  "Fewer spikes after meals",
  "General metabolic health",
] as const;

export default function MealPlanner() {
  const [diet, setDiet] = useState<(typeof DIETS)[number]>("Balanced");
  const [calories, setCalories] = useState(1800);
  const [goal, setGoal] = useState<(typeof GOALS)[number]>(GOALS[1]);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diet, calorieTarget: calories, bloodSugarGoal: goal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not generate a plan.");
      setPlan(data as MealPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate a plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-xl font-bold text-slate-900">Your preferences</h3>
        <p className="mt-1 text-sm text-slate-600">
          Tell us how you eat and what your blood sugar goal is.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-800">Dietary preference</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiet(d)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    diet === d
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="calories" className="text-sm font-semibold text-slate-800">
              Daily calorie target: <span className="text-teal-700">{calories} kcal</span>
            </label>
            <input
              id="calories"
              type="range"
              min={1200}
              max={2600}
              step={50}
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="mt-3 w-full accent-teal-700"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>1200</span>
              <span>2600</span>
            </div>
          </div>

          <div>
            <label htmlFor="goal" className="text-sm font-semibold text-slate-800">
              Blood sugar goal
            </label>
            <select
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value as (typeof GOALS)[number])}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <LoadingButton loading={loading} onClick={() => void generate()}>
            Generate my day plan
          </LoadingButton>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8">
          <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
          <p className="pt-2 text-center text-sm font-medium text-slate-500">
            Building your steady-sugar day…
          </p>
        </div>
      ) : null}

      {plan ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <h3 className="text-xl font-bold text-slate-900">{plan.dayTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              <span className="font-semibold">Steady-sugar tip:</span> {plan.bloodSugarTip}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Day total calories" value={Math.round(plan.totalCalories)} unit="kcal" />
            <MetricCard label="Day total net carbs" value={Math.round(plan.totalNetCarbs)} unit="g" />
          </div>

          <ol className="space-y-3">
            {plan.meals.map((meal, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-700 text-white">
                  <span className="text-[10px] font-semibold uppercase">{meal.time.split(" ")[1] ?? ""}</span>
                  <span className="text-sm font-bold">{meal.time.split(" ")[0]}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h4 className="text-lg font-bold text-slate-900">{meal.name}</h4>
                    <span className="text-xs font-semibold text-slate-500">
                      {Math.round(meal.calories)} kcal · {Math.round(meal.netCarbs)} g net carbs
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{meal.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
