# NutriCare 🩺

**AI-powered diabetic & metabolic health companion** — snap a meal, get instant carb and glycemic insights, a tailored daily meal plan, and a multilingual AI coach. Built with Next.js and the Gemini API for the DITE hackathon under the SLC (Simple, Lovable, Complete) framework.

> **Zero auth. Zero manual entry. One snap.**

## ✨ Features

| Feature | What it does |
| --- | --- |
| 📸 **One-Snap Meal & Carb Tracker** | Upload or snap a plate photo → Gemini vision estimates calories, net carbs, and a color-coded **Glycemic Impact Score** (🟢 Low / 🟡 Medium / 🔴 High) with portion-tweak advice. Copy or download results as CSV. |
| 🍽️ **Tailored Meal Planner** | Pick a diet (Vegetarian / Keto / Balanced), calorie target, and blood sugar goal → instant 1-day plan optimized for steady blood sugar. |
| 💬 **Personal AI Coach** | Empathetic clinical nutrition Q&A with safety guardrails — available in **English, اردو (Urdu), and سنڌي (Sindhi)**. |
| 🧾 **Lab Report Summary** | Snap an HbA1c report or prescription → simple AI summary in your chosen language. |

## 🏗️ Architecture

```
app/
  page.tsx              # Zero-auth tabbed dashboard
  api/analyze/          # Photo → structured meal JSON (calories, net carbs, glycemic score)
  api/meal-plan/        # Preferences → structured 1-day plan
  api/coach/            # Multilingual chat with system-prompt guardrails
  api/summarize/        # Lab report / prescription → simple summary
lib/
  gemini.ts             # Google GenAI client, prompts, JSON schemas
  types.ts              # Shared types, languages, disclaimer
components/             # SnapTracker, MealPlanner, Coach, UI kit
```

- **Model:** `gemini-3.8-flash` (override with `GEMINI_MODEL`, e.g. `gemini-3.5-flash-lite` if you hit free-tier limits)
- **Structured outputs** (`responseSchema`) guarantee clean JSON for the UI
- **Server-side key only** — `GEMINI_API_KEY` is read via `process.env`, never shipped to the browser, never committed

## 🚀 Local setup

1. Get a free key at [Google AI Studio](https://aistudio.google.com) → **Get API key**
2. Install and configure:

   ```bash
   npm install
   cp .env.example .env.local   # then paste your key into .env.local
   ```

3. Run:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 — no login, straight to the dashboard.

## ☁️ Deploy on Render

1. Push this repo to GitHub (public)
2. On [Render](https://render.com): **New → Web Service** → connect the repo
3. Build command: `npm install && npm run build` · Start command: `npm start`
4. Add environment variable **`GEMINI_API_KEY`** (and optionally `GEMINI_MODEL`) in the Render dashboard
5. Deploy — your public live URL is ready

> Free-tier Render services spin down when idle; wake the app ~30s before your demo.

## 🔐 Security & compliance rules (DITE standard)

- **Zero hardcoded keys** — only `process.env.GEMINI_API_KEY`; `.env*` git-ignored (`.env.example` is the committed template)
- **Zero auth / happy path** — instant dashboard, no login screens
- **Mandatory medical disclaimer** on every screen; coach and summaries end with an inline disclaimer and refuse to diagnose or advise on medication

## 📹 Submission checklist

- [x] Clean, well-structured code
- [ ] Public GitHub repo with this README
- [ ] Live public link (Render)
- [ ] 3–5 minute demo video on Google Drive — *Anyone with the link can view*

## 🧪 Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · @google/genai · Render
