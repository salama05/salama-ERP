"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LanguageProvider, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";

const THEME_KEY = "saas_walaa_theme";
const SIDEBAR_KEY = "saas_walaa_sidebar_collapsed";

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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getSaved(THEME_KEY, "dark"));
    setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "true");
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

  const toggleSidebar = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  if (!mounted) return null;

  return (
    <div
      dir={dir}
      lang={language}
      className="relative min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] overflow-x-hidden w-full max-w-full"
    >
      {/* Sidebar Component (Desktop fixed & Mobile Off-canvas Drawer) */}
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Page Area */}
      <div
        className={cn(
          "min-h-screen transition-[margin] duration-300 w-full max-w-full overflow-x-hidden flex flex-col",
          collapsed ? "md:ms-[var(--sidebar-collapsed-width)]" : "md:ms-[var(--sidebar-width)]"
        )}
      >
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Demo Mode Alert Banner */}
        <DemoBanner />

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
