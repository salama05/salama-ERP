"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UserPlus, Mail, User, Shield, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { OrganizationProfile } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const { language, dir } = useI18n();
  const isRTL = dir === "rtl";

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"invite" | "clerk">("invite");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "accountant" | "sales_manager" | "inventory_manager" | "custom">("sales_manager");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inviteUser = useMutation(api.users.inviteUser);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes("@")) {
      setError(language === "ar" ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      await inviteUser({
        email: email.trim(),
        name: name.trim() || undefined,
        role,
      });

      setSuccess(
        language === "ar"
          ? "تمت إضافة المستخدم وتعيين الصلاحيات بنجاح!"
          : "User added and permissions assigned successfully!"
      );
      setEmail("");
      setName("");
      
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === "ar" ? "فشل إضافة المستخدم" : "Failed to invite user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/75 backdrop-blur-md p-4 sm:p-6 flex min-h-full items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative my-auto w-full max-w-lg rounded-2xl shadow-2xl border transition-all duration-200 overflow-hidden flex flex-col max-h-[85vh]",
          "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
        )}
        onClick={(e) => e.stopPropagation()}
        dir={dir}
      >
        {/* Header - Always visible at top */}
        <div className={cn(
          "flex-shrink-0 flex items-center justify-between p-4 px-5 border-b border-gray-200 dark:border-slate-800 bg-gray-50/90 dark:bg-slate-800/80 backdrop-blur-sm",
          isRTL && "flex-row-reverse"
        )}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {language === "ar" ? "دعوة / إضافة مستخدم جديد" : "Invite New User"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex-shrink-0 flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-900/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab("invite")}
            className={cn(
              "px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "invite"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400"
            )}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{language === "ar" ? "دعوة مباشرة (سريعة)" : "Quick Invite"}</span>
          </button>
          <button
            onClick={() => setActiveTab("clerk")}
            className={cn(
              "px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "clerk"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400"
            )}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{language === "ar" ? "ملف المنظمة (Clerk)" : "Clerk Org Settings"}</span>
          </button>
        </div>

        {/* Form Body - Compact padding & scrollable if needed */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "invite" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  {language === "ar" ? "البريد الإلكتروني للمستخدم" : "Email Address"} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* User Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  {language === "ar" ? "الاسم الكامل (اختياري)" : "Full Name (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={language === "ar" ? "مثال: أحمد محمود" : "e.g. John Doe"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  {language === "ar" ? "الدور والصلاحيات" : "Role & Permissions"} *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="admin" className="bg-white dark:bg-slate-800">Admin (مدير النظام)</option>
                  <option value="accountant" className="bg-white dark:bg-slate-800">Accountant (محاسب)</option>
                  <option value="sales_manager" className="bg-white dark:bg-slate-800">Sales Manager (مدير مبيعات)</option>
                  <option value="inventory_manager" className="bg-white dark:bg-slate-800">Inventory Manager (مدير مخزون)</option>
                  <option value="custom" className="bg-white dark:bg-slate-800">Custom (صلاحيات مخصصة)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className={cn("flex justify-end gap-2.5 pt-3 border-t border-gray-200 dark:border-slate-800", isRTL && "flex-row-reverse")}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl h-10 px-4 border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="rounded-xl h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting
                    ? (language === "ar" ? "جاري الإرسال..." : "Sending...")
                    : (language === "ar" ? "إرسال الدعوة" : "Send Invite")}
                </Button>
              </div>
            </form>
          ) : (
            <div className="clerk-org-wrapper rounded-xl overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              <OrganizationProfile 
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full shadow-none",
                    card: "bg-transparent shadow-none border-0 p-0 text-slate-900 dark:text-slate-100",
                    navbar: "bg-gray-50 dark:bg-slate-800/60 border-r dark:border-slate-800 text-xs",
                    pageScrollBox: "bg-transparent text-slate-900 dark:text-slate-100 p-2",
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
