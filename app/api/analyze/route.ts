import { NextRequest, NextResponse } from "next/server";
import {
  ANALYZE_SCHEMA,
  analyzePrompt,
  generateWithFallback,
} from "@/lib/gemini";

interface AnalyzeBody {
  image: string;
  mimeType?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeBody;
    if (!body?.image) {
      return NextResponse.json(
        { error: "Missing image. Send { image: base64 }." },
        { status: 400 }
      );
    }

    const text = await generateWithFallback({
      contents: [
        {
          inlineData: {
            mimeType: body.mimeType || "image/jpeg",
            data: body.image,
          },
        },
        { text: analyzePrompt() },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYZE_SCHEMA,
      },
    });

    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to analyze the photo.";
    const status = message.includes("GEMINI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
