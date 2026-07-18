"use client";

import { useEffect, useState } from "react";
import { FlaskConical, CheckCircle2, AlertCircle } from "lucide-react";

const DEMO_FEATURES = [
  "تجربة واقعية بدون تسجيل",
  "بيانات جاهزة: منتجات، زبائن، فواتير",
  "وضع POS كامل الوظائف",
  "تقارير وإحصائيات تفصيلية",
  "30 دقيقة + 50 عملية مجانًا",
];

/**
 * Demo entry splash page.
 *
 * Strategy (Solution B — full Clerk bypass):
 *   1. Show animated welcome screen.
 *   2. After a brief delay, redirect the browser to /api/demo/start.
 *   3. The API route sets a `demo_session` cookie and issues a server-side
 *      redirect to /overview.
 *   4. The middleware sees the cookie and lets the request through without
 *      checking Clerk at all.
 *
 * No Clerk SignInToken, no cross-domain cookie handshake, no race conditions.
 */
export default function DemoPage() {
  const [phase, setPhase] = useState<"welcome" | "redirecting">("welcome");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Show the welcome animation for 2 s, then hand off to the API.
    const timer = setTimeout(() => {
      setPhase("redirecting");
      // The API sets the cookie and returns a 302 → /overview.
      // Using window.location ensures the browser follows the redirect
      // natively and the Set-Cookie header is applied correctly.
      window.location.href = "/api/demo/start";
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-base)] px-6 text-[var(--color-text-primary)]"
    >
      {/* Glow orb */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-48 w-48 sm:h-72 sm:w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--color-brand)" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
          {error ? (
            <AlertCircle className="h-10 w-10 text-red-400" />
          ) : (
            <FlaskConical className="h-10 w-10 text-amber-400" />
          )}
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <div className="inline-block rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/20">
            وضع الديمو التجريبي
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {error ? "تعذّر بدء الديمو" : "أهلًا بك في سلامة ERP"}
          </h1>
          <p className="max-w-sm text-base text-[var(--color-text-secondary)]">
            {error
              ? error
              : phase === "welcome"
              ? "جاري تحضير بيئة تجريبية خاصة بك مع بيانات واقعية جاهزة…"
              : "جاري تسجيل الدخول التلقائي، يُرجى الانتظار…"}
          </p>
        </div>

        {error ? (
          <button
            onClick={() => {
              setError(null);
              setPhase("redirecting");
              window.location.href = "/api/demo/start";
            }}
            className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
          >
            حاول مجدداً
          </button>
        ) : (
          <>
            {/* Feature list */}
            <ul className="space-y-3 text-right">
              {DEMO_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]"
                >
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Animated progress bar */}
            <div className="w-64 overflow-hidden rounded-full bg-[var(--color-bg-elevated)] h-1.5">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] demo-loading-bar"
                style={{ animation: "demo-load 2s ease-in-out forwards" }}
              />
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              لا يلزم إيميل أو كلمة مرور
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes demo-load {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .demo-loading-bar { width: 0%; }
      `}</style>
    </div>
  );
}
