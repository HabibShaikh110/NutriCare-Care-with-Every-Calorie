export type Lang = "en" | "ur" | "sd";

export const LANGUAGES: Record<
  Lang,
  { label: string; dir: "ltr" | "rtl"; instruction: string }
> = {
  en: {
    label: "English",
    dir: "ltr",
    instruction: "Always reply in clear, simple English.",
  },
  ur: {
    label: "اردو",
    dir: "rtl",
    instruction:
      "always reply entirely in Urdu (اردو) written in the Nastaliq script.",
  },
  sd: {
    label: "سنڌي",
    dir: "rtl",
    instruction:
      "always reply entirely in Sindhi (سنڌي) written in the Arabic-based Sindhi script.",
  },
};

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  netCarbs: number;
}

export type GlycemicLevel = "Low" | "Medium" | "High";

export interface MealAnalysis {
  mealName: string;
  items: FoodItem[];
  totalCalories: number;
  totalNetCarbs: number;
  glycemicScore: number;
  glycemicImpact: GlycemicLevel;
  portionAdvice: string;
}

export interface PlannedMeal {
  time: string;
  name: string;
  description: string;
  calories: number;
  netCarbs: number;
}

export interface MealPlan {
  dayTitle: string;
  bloodSugarTip: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalNetCarbs: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export const DISCLAIMER =
  "NutriCare provides AI-generated estimates for educational purposes only. It is not a medical device and does not provide diagnoses or treatment. Always consult your doctor, pharmacist, or diabetes educator before making changes to your diet, medication, or care routine.";

export function glycemicColor(score: number): {
  label: GlycemicLevel;
  badge: string;
  dot: string;
} {
  if (score < 55)
    return {
      label: "Low",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
    };
  if (score < 70)
    return {
      label: "Medium",
      badge: "bg-amber-100 text-amber-900 border-amber-300",
      dot: "bg-amber-500",
    };
  return {
    label: "High",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
  };
}
