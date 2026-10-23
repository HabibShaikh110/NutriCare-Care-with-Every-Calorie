"use client";

import { useEffect, useRef, useState } from "react";
import { fileToCompressedBase64 } from "@/lib/image";
import { LANGUAGES, type ChatMessage, type Lang } from "@/lib/types";
import { ChatIcon } from "./icons";
import { ErrorBanner, LoadingButton, Spinner } from "./ui";

const STARTERS: Record<Lang, string> = {
  en: "Can I eat fruit if I have diabetes?",
  ur: "کیا ذیابیطس والے پھل کھا سکتے ہیں؟",
  sd: "ڇا ڊاٻيتي وارا پھل کا کا کڍي سگهون ٿا؟",
};

export default function Coach() {
  const [language, setLanguage] = useState<Lang>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docSummary, setDocSummary] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "The coach is unavailable.");
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The coach is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const summarizeDoc = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setDocError("Please upload a clear photo of the report or prescription.");
      return;
    }
    setDocError(null);
    setDocSummary(null);
    setDocLoading(true);
    try {
      const { base64, mimeType } = await fileToCompressedBase64(file);
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not read the document.");
      setDocSummary(data.summary as string);
    } catch (err) {
      setDocError(err instanceof Error ? err.message : "Could not read the document.");
    } finally {
      setDocLoading(false);
    }
  };

  const rtl = language !== "en";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Ask your AI coach</h3>
            <p className="text-sm text-slate-600">Diet and lifestyle questions, answered kindly.</p>
          </div>
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(Object.keys(LANGUAGES) as Lang[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  language === code
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                {LANGUAGES[code].label}
              </button>
            ))}
          </div>
        </div>

        <div
          dir={rtl ? "rtl" : "ltr"}
          className="mt-5 flex max-h-96 min-h-64 flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          {messages.length === 0 ? (
            <div className="m-auto max-w-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <ChatIcon className="h-7 w-7" aria-hidden />
              </div>
              <p className={`mt-3 font-semibold text-slate-700 ${rtl ? "urdu-text" : ""}`}>
                {language === "en"
                  ? "Ask anything about food, carbs, or daily habits."
                  : language === "ur"
                    ? "کھانے، کاربوہائیڈریٹ یا روزمرہ کی عادتوں کے بارے میں کچھ بھی پوچھیں۔"
                    : "کھانے، ڪاربوهائيڊريٽ يا روزمرہ جي عادتوں بابت کجه به پڇو."}
              </p>
            </div>
          ) : null}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                m.role === "user"
                  ? "self-end bg-teal-700 text-white"
                  : "self-start border border-slate-200 bg-white text-slate-800"
              }`}
            >
              <p className={m.role === "assistant" && rtl ? "urdu-text" : ""}>{m.text}</p>
            </div>
          ))}

          {loading ? (
            <div className="self-start rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Spinner className="h-4 w-4 text-teal-700" />
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>

        {messages.length === 0 ? (
          <button
            type="button"
            onClick={() => void send(STARTERS[language])}
            className={`mt-3 text-sm font-semibold text-teal-700 hover:underline ${rtl ? "urdu-text" : ""}`}
          >
            {STARTERS[language]}
          </button>
        ) : null}

        {error ? <div className="mt-3"><ErrorBanner message={error} /></div> : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            dir={rtl ? "rtl" : "ltr"}
            placeholder={language === "en" ? "Type your question…" : "اپنا سوال لکھیں…"}
            className={`flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30 ${rtl ? "urdu-text" : ""}`}
          />
          <LoadingButton loading={loading} type="submit">
            {language === "en" ? "Send" : "بھیجیں"}
          </LoadingButton>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">Lab report &amp; prescription summary</h3>
        <p className="mt-1 text-sm text-slate-600">
          Upload a photo of an HbA1c report, blood sugar result, or prescription — get a simple
          summary in {LANGUAGES[language].label}.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Upload report photo
          </button>
          <LoadingButton loading={docLoading} onClick={() => docInputRef.current?.click()}>
            {docLoading ? "Reading…" : "Summarize"}
          </LoadingButton>
          <input
            ref={docInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void summarizeDoc(e.target.files?.[0] ?? undefined)}
          />
        </div>
        {docError ? <div className="mt-3"><ErrorBanner message={docError} /></div> : null}
        {docSummary ? (
          <div
            dir={rtl ? "rtl" : "ltr"}
            className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 text-sm leading-7 text-slate-800"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
              Simple summary
            </p>
            <p className={`mt-2 whitespace-pre-line ${rtl ? "urdu-text" : ""}`}>{docSummary}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
