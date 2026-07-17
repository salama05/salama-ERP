"use client";

import { useEffect, useRef } from "react";
import { FlaskConical, RefreshCcw, UserPlus } from "lucide-react";

interface DemoSessionExpiredModalProps {
  open: boolean;
  onRestart: () => void;
  onSignup: () => void;
}

/**
 * Modal displayed when the 30-minute demo session expires.
 * Offers two paths: restart demo or create a real account.
 */
export function DemoSessionExpiredModal({
  open,
  onRestart,
  onSignup,
}: DemoSessionExpiredModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      id="demo-expired-dialog"
      className="
        fixed inset-0 m-auto w-full max-w-md rounded-2xl border border-[var(--color-border)]
        bg-[var(--color-bg-elevated)] p-0 shadow-2xl shadow-black/40
        backdrop:bg-black/60 backdrop:backdrop-blur-sm
        open:flex open:flex-col
      "
      aria-labelledby="demo-expired-title"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-4 px-8 pt-8 pb-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
          <FlaskConical className="h-8 w-8 text-amber-500" />
        </div>

        <div className="space-y-2">
          <h2
            id="demo-expired-title"
            className="text-xl font-bold text-[var(--color-text-primary)]"
          >
            انتهت جلسة الديمو
          </h2>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            لقد انتهت مدة الـ 30 دقيقة. يمكنك بدء جلسة تجريبية جديدة أو
            إنشاء حسابك الحقيقي والاستفادة من كامل ميزات النظام.
          </p>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mx-8 mb-6 rounded-xl bg-[var(--color-bg-base)] p-4 text-sm">
        <p className="mb-3 font-semibold text-[var(--color-text-primary)]">
          مع الحساب الحقيقي تحصل على:
        </p>
        <ul className="space-y-2 text-[var(--color-text-secondary)]">
          {[
            "بيانات حقيقية محفوظة بأمان",
            "فواتير رسمية قابلة للطباعة",
            "تقارير مالية تفصيلية",
            "إدارة متعددة الفروع",
            "دعم فني متكامل",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 px-8 pb-8">
        <button
          id="demo-expired-signup-btn"
          onClick={onSignup}
          className="
            flex items-center justify-center gap-2 rounded-full
            bg-[var(--color-primary)] px-6 py-3.5
            text-sm font-bold text-white shadow-lg shadow-[rgba(99,102,241,0.3)]
            transition hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 active:scale-95
          "
        >
          <UserPlus className="h-4 w-4" />
          أنشئ حسابي الحقيقي مجاناً
        </button>

        <button
          id="demo-expired-restart-btn"
          onClick={onRestart}
          className="
            flex items-center justify-center gap-2 rounded-full
            border border-[var(--color-border)] bg-[var(--color-bg-elevated)]
            px-6 py-3.5 text-sm font-semibold text-[var(--color-text-secondary)]
            transition hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]
          "
        >
          <RefreshCcw className="h-4 w-4" />
          أعد الديمو من البداية
        </button>
      </div>
    </dialog>
  );
}
