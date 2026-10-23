import { GoogleGenAI, Type } from "@google/genai";
import type { ContentListUnion, GenerateContentConfig } from "@google/genai";
import { LANGUAGES, type Lang } from "./types";

let client: GoogleGenAI | null = null;

export function geminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env.local (local) or Render environment variables (deployed)."
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
export const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";

function isRetryable(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /UNAVAILABLE|RESOURCE_EXHAUSTED|"code":\s*(429|503)|high demand|overloaded|fetch failed|network|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|und_err/i.test(
    message
  );
}

export async function generateWithFallback(params: {
  contents: ContentListUnion;
  config?: GenerateContentConfig;
}): Promise<string> {
  const models = Array.from(new Set([MODEL, FALLBACK_MODEL]));
  let lastError: unknown = new Error("No models attempted.");
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
    for (const model of models) {
      try {
        const response = await geminiClient().models.generateContent({
          model,
          ...params,
        });
        const text = response.text?.trim();
        if (text) return text;
        lastError = new Error("The model returned an empty response. Please try again.");
      } catch (err) {
        lastError = err;
        if (!isRetryable(err)) throw err;
      }
    }
  }
  throw lastError;
}

export const SAFETY_DISCLAIMER =
  "This is general educational information, not medical advice. Talk to your doctor before changing your diet, medication, or care routine.";

const GUARDRAILS = `You are the NutriCare coach: an empathetic clinical nutrition assistant for people living with diabetes and metabolic conditions, including elderly users in Pakistan.

Scope rules (never break these):
- Answer only about nutrition, food, gentle lifestyle habits, blood sugar basics, and reading food labels.
- Never diagnose conditions, never suggest changing, stopping, or dosing medication, and never interpret a condition as an emergency.
- If asked about medications, symptoms, or anything outside nutrition, gently redirect to a doctor or pharmacist.
- Prefer short sentences and simple words. Be warm and encouraging.
- When suggesting foods, prefer ordinary Pakistani home food and local market options: roti/chapati, daal, sabzi (bhindi, tori, lauki, palak), chawal in small portions, khichdi, dahi, raita, omelette, boiled eggs, chicken tikka, seekh kabab, haleem, seasonal fruit (kinnow, kela, seb, amrood), plain chai with little sugar. Avoid western health foods (quinoa, kale, avocado, smoothie bowls) unless the user asks for them.
- Give portions in local units: 1 roti, 1 katori (small bowl), 1 cup, half plate.
- Always end your reply with exactly one short disclaimer line: "${SAFETY_DISCLAIMER}"`;

export const ANALYZE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mealName: { type: Type.STRING, description: "Short friendly name of the meal" },
    items: {
      type: Type.ARRAY,
      description: "Individual foods visible on the plate",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          portion: {
            type: Type.STRING,
            description: "Estimated portion, e.g. '1 cup', '1 medium chapati'",
          },
          calories: { type: Type.NUMBER },
          netCarbs: {
            type: Type.NUMBER,
            description: "Total carbs minus fiber, in grams",
          },
        },
        required: ["name", "portion", "calories", "netCarbs"],
      },
    },
    totalCalories: { type: Type.NUMBER },
    totalNetCarbs: { type: Type.NUMBER, description: "Sum of net carbs in grams" },
    glycemicScore: {
      type: Type.NUMBER,
      description:
        "Estimated glycemic impact of this meal as a number from 0 to 100 (under 55 Low, 55-69 Medium, 70+ High)",
    },
    glycemicImpact: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    portionAdvice: {
      type: Type.STRING,
      description:
        "One or two practical sentences on how to tweak portions to flatten the blood sugar spike",
    },
  },
  required: [
    "mealName",
    "items",
    "totalCalories",
    "totalNetCarbs",
    "glycemicScore",
    "glycemicImpact",
    "portionAdvice",
  ],
} as const;

export const MEAL_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    dayTitle: { type: Type.STRING, description: "Short friendly title for the day's plan" },
    bloodSugarTip: {
      type: Type.STRING,
      description: "One practical tip to keep blood sugar steady today",
    },
    meals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "e.g. '8:00 AM'" },
          name: { type: Type.STRING },
          description: {
            type: Type.STRING,
            description: "2-3 sentence meal description with simple ingredients",
          },
          calories: { type: Type.NUMBER },
          netCarbs: { type: Type.NUMBER, description: "Net carbs in grams" },
        },
        required: ["time", "name", "description", "calories", "netCarbs"],
      },
    },
    totalCalories: { type: Type.NUMBER },
    totalNetCarbs: { type: Type.NUMBER },
  },
  required: ["dayTitle", "bloodSugarTip", "meals", "totalCalories", "totalNetCarbs"],
} as const;

export function analyzePrompt(): string {
  return `You are a clinical nutritionist estimating a meal from a photo for a person managing diabetes in Pakistan.
Identify each food item, estimate portions, calories, and net carbs (total carbs minus fiber).
Recognize common Pakistani/South Asian dishes by their local names: biryani, pulao, nihari, karahi, haleem, daal chawal, seekh kabab, chicken tikka, paratha, naan, roti/chapati, pakora, chai, omelette, aloo gosht, bhindi, palak paneer, khichdi, etc.
Estimate portions in local units: 1 roti/chapati, 1 katori (small bowl) of daal/sabzi, 1 plate or half plate of rice, 1 cup chai.
Estimate the overall glycemic impact of the meal as a 0-100 score and label it Low/Medium/High.
Give practical portion-tweak advice to reduce a blood sugar spike, using desi examples (for example: "eat 1 less roti", "have the daal with the roti instead of extra rice", "skip the sugary drink, take plain chai").
Be realistic about portion sizes. If part of the plate is unclear, give your best conservative estimate.`;
}

export function mealPlanPrompt(
  diet: string,
  calorieTarget: number,
  bloodSugarGoal: string
): string {
  return `Create a 1-day meal plan for a person managing diabetes, living in Pakistan.
Dietary preference: ${diet}.
Daily calorie target: about ${calorieTarget} kcal.
Blood sugar goal: ${bloodSugarGoal}.

Rules:
- 3 main meals plus 2 small snacks, with times.
- Keep the day close to the calorie target (within about 10%) and optimize for steady blood sugar: low glycemic carbs, enough protein and fiber, healthy fats.
- Build the plan around ordinary Pakistani home food — the kind a local family actually cooks. Use dishes by their everyday names: roti/chapati, phulka, daal (masoor/moong/chana), sabzi (bhindi, tori, lauki, palak, aloo gosht, karahi), chawal (small portion), khichdi, omelette, boiled eggs, dahi, raita, seekh kabab, chicken tikka, haleem, besan ki roti.
- Drinks: plain chai with little or no sugar, or doodh patti; never sugary drinks. For sweets/fruit, use local seasonal options (kinnow, kela in small quantity, seb, amrood) with clear limits.
- Do NOT use western health foods (quinoa, kale, avocado, smoothie bowls, oat milk). If a recipe needs a substitute, use a desi one (brown chawal over white, lauki/kaddu instead of exotic vegetables).
- Say every dish the way a Pakistani family would say it — e.g. "Daal Chawal with Raita", "2 Roti with Aloo Gosht", "Besan ki Roti with Curd".
- Describe portions in local units: roti, katori (small bowl), cup, plate/half plate.
- Give each meal a 2-3 sentence description an elderly user can follow, plus calories and net carbs.
- Add one practical blood sugar tip for the day, using desi examples.`;
}

export function coachSystemPrompt(lang: Lang): string {
  return `${GUARDRAILS}

Language rule: ${LANGUAGES[lang].instruction}`;
}

export function summarizeSystemPrompt(lang: Lang): string {
  return `You are the NutriCare assistant helping a patient understand a photo of their lab report (for example an HbA1c or blood sugar result) or their prescription.

Rules:
- Summarize in very simple, non-technical language an elderly user can understand.
- Describe what values you can read and what they generally mean, in plain words.
- Never diagnose. Never recommend changing medication or doses.
- Encourage the user to discuss the report with their doctor.
- ${LANGUAGES[lang].instruction}
- End with exactly one short disclaimer line: "${SAFETY_DISCLAIMER}"`;
}
