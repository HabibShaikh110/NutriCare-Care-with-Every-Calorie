import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback, summarizeSystemPrompt } from "@/lib/gemini";
import type { Lang } from "@/lib/types";

interface SummarizeBody {
  image: string;
  mimeType?: string;
  language: Lang;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SummarizeBody;
    if (!body?.image) {
      return NextResponse.json(
        { error: "Missing image. Send { image: base64, language }." },
        { status: 400 }
      );
    }

    const lang: Lang =
      body.language === "ur" || body.language === "sd" ? body.language : "en";

    const text = await generateWithFallback({
      contents: [
        {
          inlineData: {
            mimeType: body.mimeType || "image/jpeg",
            data: body.image,
          },
        },
        {
          text: "Summarize this lab report or prescription for the patient in simple language.",
        },
      ],
      config: {
        systemInstruction: summarizeSystemPrompt(lang),
      },
    });

    return NextResponse.json({ summary: text });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to summarize the document.";
    const status = message.includes("GEMINI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
