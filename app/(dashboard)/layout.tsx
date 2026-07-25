"use client";

import { useCallback, useEffect, useState } from "react";
import { LanguageProvider, useI18n } from "@/lib/i18n";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { Header } from "@/components/dashboard/Header";
import { SidebarContent, MobileDrawer } from "@/components/dashboard/Sidebar";

const THEME_KEY = "saas_walaa_theme";

function getSaved<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return (window.localStorage.getItem(key) as T) ?? fallback;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DashboardShell>{children}</DashboardShell>
    </LanguageProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { language, dir } = useI18n();

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getSaved(THEME_KEY, "dark"));
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [dir, language]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  if (!mounted) return null;

  return (
    <div
      dir={dir}
      lang={language}
      className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden"
    >
      {/* Desktop Sidebar (Fixed on side for Desktop, hidden lg:block) */}
      <aside className="hidden lg:block lg:w-64 shrink-0 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Off-Canvas Drawer (lg:hidden, active when mobileOpen === true) */}
      {mobileOpen && (
        <MobileDrawer onClose={() => setMobileOpen(false)} />
      )}

      {/* Main Content Area for Desktop & Mobile */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onMobileToggle={() => setMobileOpen((prev) => !prev)}
        />

        {/* Demo Mode Alert Banner */}
        <DemoBanner />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
