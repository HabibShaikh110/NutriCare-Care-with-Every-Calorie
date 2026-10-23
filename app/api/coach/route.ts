import { NextRequest, NextResponse } from "next/server";
import { coachSystemPrompt, generateWithFallback } from "@/lib/gemini";
import type { ChatMessage, Lang } from "@/lib/types";

interface CoachBody {
  messages: ChatMessage[];
  language: Lang;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CoachBody;
    const messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Send at least one chat message." },
        { status: 400 }
      );
    }

    const lang: Lang =
      body.language === "ur" || body.language === "sd" ? body.language : "en";

    const contents = messages.slice(-12).map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.text }],
    }));

    const text = await generateWithFallback({
      contents,
      config: {
        systemInstruction: coachSystemPrompt(lang),
      },
    });

    return NextResponse.json({ reply: text });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "The coach is unavailable right now.";
    const status = message.includes("GEMINI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
