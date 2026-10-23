import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriCare — AI Metabolic Health Companion",
  description:
    "Snap a meal, get instant carb and glycemic insights, tailored meal plans, and a multilingual AI coach. Powered by Gemini.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col bg-slate-50 text-slate-900"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
