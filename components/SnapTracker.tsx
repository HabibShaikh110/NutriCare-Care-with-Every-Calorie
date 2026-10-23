"use client";

import { useCallback, useRef, useState } from "react";
import { fileToCompressedBase64 } from "@/lib/image";
import type { MealAnalysis } from "@/lib/types";
import { ErrorBanner, MetricCard, ScoreBadge, Spinner } from "./ui";

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function SnapTracker() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<MealAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (photo of a plate or report).");
      return;
    }
    setError(null);
    setResult(null);
    setCopied(false);
    try {
      const url = URL.createObjectURL(file);
      setPreview(url);
      const { base64, mimeType } = await fileToCompressedBase64(file);
      setLoading(true);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analysis failed.");
      setResult(data as MealAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const copyResult = async () => {
    if (!result) return;
    const text = [
      `NutriCare — ${result.mealName}`,
      `Calories: ${Math.round(result.totalCalories)} kcal`,
      `Net carbs: ${Math.round(result.totalNetCarbs)} g`,
      `Glycemic impact: ${result.glycemicImpact} (${Math.round(result.glycemicScore)}/100)`,
      "",
      "Items:",
      ...result.items.map(
        (i) => `• ${i.name} (${i.portion}) — ${Math.round(i.calories)} kcal, ${Math.round(i.netCarbs)} g net carbs`
      ),
      "",
      `Tip: ${result.portionAdvice}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCsv = () => {
    if (!result) return;
    const rows = [
      ["Item", "Portion", "Calories", "Net Carbs (g)"],
      ...result.items.map((i) => [i.name, i.portion, Math.round(i.calories), Math.round(i.netCarbs)]),
      ["TOTAL", "", Math.round(result.totalCalories), Math.round(result.totalNetCarbs)],
      [],
      ["Glycemic impact", result.glycemicImpact],
      ["Glycemic score", Math.round(result.glycemicScore)],
      ["Portion advice", result.portionAdvice],
    ];
    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nutricare-meal.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={`rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-12 ${
          dragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-white"
        }`}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
            <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="13.5" r="3.5" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900">Snap your plate</h3>
        <p className="mt-1 text-slate-600">
          Drag &amp; drop a food photo, or use the buttons below.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Upload photo
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Use camera
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? undefined)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? undefined)}
        />
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-10">
          <Spinner className="h-8 w-8 text-teal-700" />
          <p className="font-semibold text-slate-700">Analyzing your plate…</p>
          <p className="text-sm text-slate-500">Estimating portions, calories, and glycemic impact</p>
        </div>
      ) : null}

      {preview ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Uploaded meal" className="max-h-80 w-full object-contain bg-slate-100" />
        </div>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-bold text-slate-900">{result.mealName}</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyResult}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
              <button
                type="button"
                onClick={downloadCsv}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Estimated calories" value={Math.round(result.totalCalories)} unit="kcal" />
            <MetricCard label="Net carbs" value={Math.round(result.totalNetCarbs)} unit="g" hint="Total carbs minus fiber" />
            <ScoreBadge score={result.glycemicScore} impact={result.glycemicImpact} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Portion</th>
                  <th className="px-4 py-3 text-right">Calories</th>
                  <th className="px-4 py-3 text-right">Net carbs</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.portion}</td>
                    <td className="px-4 py-3 text-right text-slate-900">{Math.round(item.calories)}</td>
                    <td className="px-4 py-3 text-right text-slate-900">{Math.round(item.netCarbs)} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Portion tweak advice</p>
            <p className="mt-2 text-base leading-6 text-slate-800">{result.portionAdvice}</p>
          </div>
        </div>
      ) : null}

      {!preview && !loading && !result ? (
        <p className="text-center text-sm text-slate-500">
          Tip: take the photo from above, with the whole plate in frame.
        </p>
      ) : null}
    </div>
  );
}
