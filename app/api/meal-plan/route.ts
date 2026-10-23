import { NextRequest, NextResponse } from "next/server";
import {
  MEAL_PLAN_SCHEMA,
  generateWithFallback,
  mealPlanPrompt,
} from "@/lib/gemini";

interface PlanBody {
  diet: string;
  calorieTarget: number;
  bloodSugarGoal: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PlanBody;
    if (!body?.diet || !body?.bloodSugarGoal || !body?.calorieTarget) {
      return NextResponse.json(
        { error: "Missing diet, calorieTarget, or bloodSugarGoal." },
        { status: 400 }
      );
    }

    const calorieTarget = Math.min(4000, Math.max(800, body.calorieTarget));

    const text = await generateWithFallback({
      contents: [
        { text: mealPlanPrompt(body.diet, calorieTarget, body.bloodSugarGoal) },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: MEAL_PLAN_SCHEMA,
      },
    });

    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to build the meal plan.";
    const status = message.includes("GEMINI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
