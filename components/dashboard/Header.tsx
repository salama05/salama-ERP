"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Sun, 
  Moon, 
  Building2, 
  LogOut, 
  UserRound, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Menu
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useIsDemoMode } from "@/components/providers/convex-client-provider";
import { useDemoSession } from "@/hooks/useDemoSession";
import { OrganizationSwitcherSafe, UserButtonSafe } from "@/components/auth/ClerkComponents";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

interface HeaderProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export function Header({ theme, toggleTheme, collapsed, setCollapsed }: HeaderProps) {
  const { language, setLanguage, dir, t } = useI18n();
  const isRTL = dir === "rtl";
  const isDemoMode = useIsDemoMode();
  const { exitDemo } = useDemoSession();

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useQuery(api.users.getCurrentUser);
  const userRole = user?.role === "admin" || user?.role === "accountant" || user?.role === "sales_manager" || user?.role === "inventory_manager" ? user?.role : undefined;
  const notifications = useQuery(api.notifications.getUnreadRoleNotifications, userRole ? { role: userRole } : "skip");
  const unreadCount = notifications?.length || 0;

  // Handle click outside notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const languageOptions = [
    { code: "fr" as const, label: "FR" },
    { code: "en" as const, label: "EN" },
    { code: "ar" as const, label: "AR" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 sm:px-6 transition-colors duration-200",
        "bg-white/95 dark:bg-slate-900/95 border-gray-200 dark:border-slate-800 backdrop-blur-md",
        isRTL && "flex-row-reverse"
      )}
    >
      {/* Left section: Logo & Mobile menu toggle */}
      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="md:hidden flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-md">
            S
          </div>
          <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100 text-base">Salama ERP</span>
        </div>

        <div className="hidden md:block">
          {isDemoMode ? (
            <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {language === "ar"
                  ? "متجر سلامة التجريبي"
                  : language === "fr"
                    ? "Boutique démo Salama"
                    : "Salama demo store"}
              </span>
            </div>
          ) : (
            <div className="relative">
              <OrganizationSwitcherSafe hidePersonal={true} />
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="hidden lg:flex flex-1 justify-center px-4 max-w-xl">
        <GlobalSearch />
      </div>

      {/* Right section: Controls & User info */}
      <div className={cn("flex items-center gap-2 sm:gap-3", isRTL && "flex-row-reverse")}>
        {/* Language selector */}
        <div className="hidden items-center gap-1 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 p-1 sm:flex">
          {languageOptions.map((option) => {
            const active = language === option.code;
            return (
              <button
                key={option.code}
                onClick={() => setLanguage(option.code)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition hover:scale-105 active:scale-95"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-600" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifications && (
            <div
              className={cn(
                "absolute top-12 z-50 w-80 sm:w-96 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl dark:shadow-2xl overflow-hidden animate-scale-in",
                isRTL ? "left-0" : "right-0"
              )}
            >
              {/* Dropdown Header */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-4 py-3 bg-gray-50/50 dark:bg-slate-800/80">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {language === "ar" ? "الإشعارات" : language === "fr" ? "Notifications" : "Notifications"}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700/50">
                {notifications && notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="p-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors flex items-start gap-3"
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                        <Info className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug uppercase tracking-wide text-[11px]">
                          {n.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 font-medium">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">
                          {new Date(n.createdAt || n._creationTime).toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center px-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/40 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {language === "ar" ? "لا توجد إشعارات جديدة" : language === "fr" ? "Aucune notification" : "No new notifications"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {language === "ar" ? "أنت مواكب لكافة التحديثات" : language === "fr" ? "Vous êtes à jour" : "You are up to date"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info / Demo badge */}
        {isDemoMode ? (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400"
            >
              <UserRound className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold">
                {user?.name || (language === "ar" ? "زائر تجريبي" : language === "fr" ? "Visiteur démo" : "Demo visitor")}
              </span>
            </div>
            <button
              type="button"
              onClick={exitDemo}
              aria-label="Exit Demo"
              className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-bold">
                {language === "ar" ? "خروج" : language === "fr" ? "Quitter" : "Exit"}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {user?.name || "المستخدم"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {user?.role || "Owner"}
              </span>
            </div>
            <UserButtonSafe />
          </div>
        )}
      </div>
    </header>
  );
}
