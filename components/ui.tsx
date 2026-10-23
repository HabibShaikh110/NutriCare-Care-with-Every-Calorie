import type { ReactNode } from "react";
import { DISCLAIMER, type GlycemicLevel } from "@/lib/types";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function LoadingButton({
  loading,
  children,
  disabled,
  className = "",
  onClick,
  type = "button",
}: {
  loading: boolean;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading && <Spinner className="h-4 w-4 text-white" />}
      {children}
    </button>
  );
}

export function MetricCard({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
        {unit ? (
          <span className="ml-1 text-base font-semibold text-slate-500">{unit}</span>
        ) : null}
      </p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function ScoreBadge({
  score,
  impact,
}: {
  score: number;
  impact?: GlycemicLevel;
}) {
  const level: GlycemicLevel = impact ?? (score < 55 ? "Low" : score < 70 ? "Medium" : "High");
  const styles =
    level === "Low"
      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
      : level === "Medium"
        ? "bg-amber-100 text-amber-900 border-amber-300"
        : "bg-rose-100 text-rose-900 border-rose-300";
  const dot =
    level === "Low"
      ? "bg-emerald-500"
      : level === "Medium"
        ? "bg-amber-500"
        : "bg-rose-500";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Glycemic Impact
      </p>
      <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 ${styles}`}>
        <span className={`h-3 w-3 rounded-full ${dot}`} aria-hidden />
        <span className="text-lg font-bold">{level}</span>
        <span className="text-sm font-semibold opacity-80">/100 · {Math.round(score)}</span>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
      {message}
    </div>
  );
}

export function Disclaimer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <p className="text-center text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-600">Medical disclaimer:</span>{" "}
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
