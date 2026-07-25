"use client";

import { useEffect, useState } from "react";
import { FlaskConical, X, UserPlus, Clock, Zap, AlertTriangle } from "lucide-react";
import { useDemoSession } from "@/hooks/useDemoSession";
import { getDemoPreferences } from "@/lib/demo-session";
import { DemoSessionExpiredModal } from "./DemoSessionExpiredModal";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";
import { DemoBannerWithClerk } from "./DemoBannerWithClerk";

interface DemoBannerProps {
  onEndDemo?: () => void;
}

/**
 * Sticky demo-mode banner shown at the top of every dashboard page.
 * Fully responsive for mobile viewports with zero horizontal overflow.
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

  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [signupParams, setSignupParams] = useState("");

  useEffect(() => {
    const prefs = getDemoPreferences();
    const params = new URLSearchParams();
    if (prefs.branches) params.set("branches", String(prefs.branches));
    if (prefs.selectedPlan) params.set("plan", prefs.selectedPlan);
    if (prefs.industry) params.set("industry", prefs.industry);
    const qs = params.toString();
    setSignupParams(qs ? `?${qs}` : "");
  }, []);

  useEffect(() => {
    if (isExpired) setShowExpiredModal(true);
  }, [isExpired]);

  const handleEndDemo = () => {
    exitDemo();
    onEndDemo?.();
  };

  if (!isDemoMode && !isExpired) return null;

  const isAlmostDone = isNearExpiry || operationsLeft <= 10;

  return (
    <>
      {/* ── Banner Container (Mobile Responsive & Zero Overflow) ────────────────── */}
      <div
        role="alert"
        aria-label="Demo mode active"
        className={`
          demo-banner relative z-50 flex w-full max-w-full overflow-x-hidden items-center justify-between gap-1.5 sm:gap-3
          px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium flex-wrap sm:flex-nowrap
          ${isAlmostDone
            ? "bg-orange-500/95 text-white"
            : "bg-amber-400/95 text-amber-950"}
          backdrop-blur-sm border-b border-white/20
          transition-colors duration-700
        `}
      >
        {/* Left: Icon + Label */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
          {isAlmostDone ? (
            <AlertTriangle className="h-4 w-4 flex-shrink-0 animate-pulse text-white" />
          ) : (
            <FlaskConical className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="hidden sm:inline font-bold">وضع الديمو التجريبي</span>
          <span className="sm:hidden font-bold text-xs">ديمو</span>
          <span className="hidden md:inline opacity-75">—</span>
          <span className="hidden lg:inline text-xs opacity-75">البيانات وهمية ولن تُحفظ</span>
        </div>

        {/* Center: Timer + Ops Counter + Signup CTA */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Timer */}
          <div
            className="flex items-center gap-1 tabular-nums font-mono bg-black/10 px-2 py-0.5 rounded-full text-xs font-bold"
            title="الوقت المتبقي"
          >
            <Clock className="h-3 w-3 opacity-80" />
            <span className={timeLeftMs < 5 * 60 * 1000 ? "animate-pulse text-red-700 dark:text-red-300" : ""}>
              {timeLeftFormatted}
            </span>
          </div>

          {/* Operations Counter */}
          <div
            className="hidden xs:flex items-center gap-1 text-xs opacity-90"
            title="العمليات المتبقية"
          >
            <Zap className="h-3 w-3 opacity-80" />
            <span>{operationsLeft} عملية</span>
          </div>

          {/* Signup CTA Button */}
          {isActuallyDemoMode ? (
            <button
              onClick={() => { window.location.href = `/sign-up${signupParams}`; }}
              id="demo-create-account-btn"
              className={`
                flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-xs font-bold
                transition hover:scale-105 active:scale-95 flex-shrink-0
                ${isAlmostDone
                  ? "bg-white text-orange-600 hover:bg-orange-50 shadow-sm"
                  : "bg-amber-900/90 text-amber-100 hover:bg-amber-950 shadow-sm"}
              `}
            >
              <UserPlus className="h-3 w-3" />
              <span className="hidden sm:inline">أنشئ حسابي الحقيقي</span>
              <span className="sm:hidden">سجّل</span>
            </button>
          ) : (
            <DemoBannerWithClerk
              signupParams={signupParams}
              isAlmostDone={isAlmostDone}
            />
          )}
        </div>

        {/* Right: End Demo Button */}
        <button
          onClick={handleEndDemo}
          aria-label="إنهاء وضع الديمو"
          title="إنهاء وضع الديمو"
          className="flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-full opacity-75 hover:opacity-100 hover:bg-black/10 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expired Modal */}
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
