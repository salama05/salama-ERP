"use client";

import { useState } from "react";
import {
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Zap,
  ShieldCheck,
  PlayCircle,
} from "lucide-react";

const DEMO_FEATURES = [
  {
    icon: ShieldCheck,
    text: "تجربة واقعية بدون تسجيل أو بريد إلكتروني",
  },
  {
    icon: CheckCircle2,
    text: "بيانات جاهزة: منتجات، زبائن، فواتير",
  },
  {
    icon: Zap,
    text: "وضع POS كامل الوظائف (تجزئة + جملة)",
  },
  {
    icon: CheckCircle2,
    text: "تقارير وإحصائيات تفصيلية",
  },
  {
    icon: Clock,
    text: "30 دقيقة + 50 عملية مجانًا",
  },
];

/**
 * Demo entry page — now shows a features Modal BEFORE starting the session.
 * The user must click "جرّب الآن" to proceed. This satisfies issue #2.
 */
export default function DemoPage() {
  /** "idle" = show modal, "starting" = redirecting, "error" = failed */
  const [phase, setPhase] = useState<"idle" | "starting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setPhase("starting");
    // The API route sets the demo_session cookie and 302-redirects to /overview.
    window.location.href = "/api/demo/start";
  };

  const handleCancel = () => {
    // Go back to the marketing / landing page
    window.location.href = "/";
  };

  const handleRetry = () => {
    setError(null);
    setPhase("starting");
    window.location.href = "/api/demo/start";
  };

  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-base)] px-4 text-[var(--color-text-primary)]"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--color-brand)" }}
      />

      {/* ──────────────── MODAL ──────────────── */}
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl border border-[var(--color-border)] shadow-2xl overflow-hidden animate-fade-up"
        style={{ background: "var(--color-bg-elevated)" }}
      >
        {/* Header strip */}
        <div className="flex items-center justify-between bg-amber-500/10 border-b border-amber-500/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : (
                <FlaskConical className="h-5 w-5 text-amber-400" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                وضع الديمو التجريبي
              </div>
              <h1 className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">
                {error ? "تعذّر بدء الديمو" : "أهلًا بك في سلامة ERP"}
              </h1>
            </div>
          </div>

          {/* Close / back button */}
          <button
            onClick={handleCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {error ? (
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          ) : (
            <>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                ستدخل الآن إلى بيئة تجريبية مع بيانات واقعية جاهزة. لا حاجة لإنشاء حساب.
              </p>

              {/* Features list */}
              <ul className="space-y-3">
                {DEMO_FEATURES.map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "var(--color-brand-dim)" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "var(--color-brand)" }} />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>

              {/* Disclaimer */}
              <p className="text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-4">
                ⚠️ البيانات في وضع الديمو وهمية ولن تُحفظ — ستُمسح تلقائياً بعد انتهاء الجلسة.
              </p>
            </>
          )}
        </div>

        {/* Footer — action buttons */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-6 py-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition"
          >
            لاحقاً
          </button>

          {error ? (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-400 transition"
            >
              حاول مجدداً
            </button>
          ) : phase === "starting" ? (
            <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-2.5 text-sm font-bold text-white opacity-75 cursor-not-allowed">
              <span className="animate-pulse">جاري التحضير…</span>
            </div>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-hover)] transition hover:scale-105 active:scale-95"
            >
              <PlayCircle className="h-4 w-4" />
              جرّب الآن مجاناً
            </button>
          )}
        </div>

        {/* Loading bar (only while redirecting) */}
        {phase === "starting" && (
          <div className="h-1 w-full bg-[var(--color-bg-surface)]">
            <div
              className="h-full rounded-full bg-[var(--color-brand)]"
              style={{ animation: "demo-load 2s ease-in-out forwards" }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes demo-load {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
