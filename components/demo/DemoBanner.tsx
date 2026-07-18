"use client";

import { useEffect, useState } from "react";
import { FlaskConical, X, UserPlus, Clock, Zap, AlertTriangle } from "lucide-react";
import { useDemoSession } from "@/hooks/useDemoSession";
import { getDemoPreferences } from "@/lib/demo-session";
import { DemoSessionExpiredModal } from "./DemoSessionExpiredModal";
import { useClerk } from "@clerk/nextjs";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";

interface DemoBannerProps {
  /** Called when the user clicks "End Demo" */
  onEndDemo?: () => void;
}

/**
 * Sticky demo mode banner shown at the top of every dashboard page.
 * Displays session timer, operation count, and CTA to create a real account.
 */
export function DemoBanner({ onEndDemo }: DemoBannerProps) {
  const {
    isDemoMode,
    timeLeftFormatted,
    timeLeftMs,
    operationsLeft,
    isNearExpiry,
    isExpired,
    exitDemo,
  } = useDemoSession();

  const isActuallyDemoMode = useIsDemoMode();
  const clerk = isActuallyDemoMode ? null : useClerk();
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [signupParams, setSignupParams] = useState("");

  // Build signup URL with demo preferences pre-filled
  useEffect(() => {
    const prefs = getDemoPreferences();
    const params = new URLSearchParams();
    if (prefs.branches) params.set("branches", String(prefs.branches));
    if (prefs.selectedPlan) params.set("plan", prefs.selectedPlan);
    if (prefs.industry) params.set("industry", prefs.industry);
    const qs = params.toString();
    setSignupParams(qs ? `?${qs}` : "");
  }, []);

  // Show expired modal when session runs out
  useEffect(() => {
    if (isExpired) {
      setShowExpiredModal(true);
    }
  }, [isExpired]);

  const handleEndDemo = () => {
    exitDemo();
    onEndDemo?.();
  };

  const handleCreateAccount = async () => {
    // Sign out from Clerk to clear demo session (only if not in demo mode)
    if (clerk) {
      await clerk.signOut();
    }
    // Redirect to sign-up page with full page reload
    window.location.href = `/sign-up${signupParams}`;
  };

  if (!isDemoMode && !isExpired) return null;

  const isAlmostDone = isNearExpiry || operationsLeft <= 10;

  return (
    <>
      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <div
        role="alert"
        aria-label="Demo mode active"
        className={`
          demo-banner relative z-50 flex items-center justify-between gap-3
          px-4 py-2.5 text-sm font-medium
          ${isAlmostDone
            ? "bg-orange-500/95 text-white"
            : "bg-amber-400/95 text-amber-950"}
          backdrop-blur-sm border-b border-white/20
          transition-colors duration-700
        `}
      >
        {/* Left: Icon + label */}
        <div className="flex items-center gap-2 min-w-0">
          {isAlmostDone ? (
            <AlertTriangle className="h-4 w-4 flex-shrink-0 animate-pulse" />
          ) : (
            <FlaskConical className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="hidden sm:inline font-semibold">
            وضع الديمو التجريبي
          </span>
          <span className="sm:hidden font-semibold text-xs">
            ديمو
          </span>
          <span className="hidden md:inline opacity-75">—</span>
          <span className="hidden md:inline text-xs opacity-75">
            البيانات وهمية ولن تُحفظ
          </span>
        </div>

        {/* Center: Timer + ops */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Timer */}
          <div
            className="flex items-center gap-1.5 tabular-nums font-mono"
            title="الوقت المتبقي"
          >
            <Clock className="h-3.5 w-3.5 opacity-70" />
            <span
              className={`text-xs font-bold ${
                timeLeftMs < 5 * 60 * 1000 ? "animate-pulse" : ""
              }`}
            >
              {timeLeftFormatted}
            </span>
          </div>

          {/* Operations counter */}
          <div
            className="hidden sm:flex items-center gap-1.5"
            title="العمليات المتبقية"
          >
            <Zap className="h-3.5 w-3.5 opacity-70" />
            <span className="text-xs">
              {operationsLeft} عملية
            </span>
          </div>

          {/* CTA button */}
          <button
            onClick={handleCreateAccount}
            id="demo-create-account-btn"
            className={`
              flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold
              transition hover:scale-105 active:scale-95
              ${isAlmostDone
                ? "bg-white text-orange-600 hover:bg-orange-50"
                : "bg-amber-900/90 text-amber-100 hover:bg-amber-950"}
            `}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">أنشئ حسابي الحقيقي</span>
            <span className="sm:hidden">سجّل</span>
          </button>
        </div>

        {/* Right: End demo button */}
        <button
          onClick={handleEndDemo}
          aria-label="إنهاء وضع الديمو"
          title="إنهاء وضع الديمو"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100 hover:bg-black/10 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Expired modal ──────────────────────────────────────────────────── */}
      <DemoSessionExpiredModal
        open={showExpiredModal}
        signupParams={signupParams}
        onRestart={() => {
          setShowExpiredModal(false);
          window.location.href = "/demo";
        }}
        onSignup={(params) => {
          setShowExpiredModal(false);
          window.location.href = `/sign-up${params}`;
        }}
      />
    </>
  );
}
