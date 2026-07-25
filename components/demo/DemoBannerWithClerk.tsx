"use client";

import { UserPlus } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

/**
 * CTA button that signs out from Clerk before redirecting to sign-up.
 * This component is ONLY rendered when <ClerkProvider> is present (non-demo mode).
 * Never mount this component inside demo mode — useClerk() would crash.
 */
export function DemoBannerWithClerk({
  signupParams,
  isAlmostDone,
}: {
  signupParams: string;
  isAlmostDone: boolean;
}) {
  const clerk = useClerk();

  const handleClick = async () => {
    try {
      await clerk.signOut();
    } catch {
      // Clerk may not have an active session; ignore the error
    }
    window.location.href = `/sign-up${signupParams}`;
  };

  return (
    <button
      onClick={handleClick}
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
  );
}
