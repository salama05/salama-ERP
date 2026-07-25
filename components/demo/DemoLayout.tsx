"use client";

import React from "react";

interface DemoLayoutProps {
  children: React.ReactNode;
}

/**
 * Responsive layout wrapper specifically for Demo Mode routes and pages.
 * Ensures zero horizontal overflow (overflow-x-hidden) on mobile screens,
 * prevents sidebar/header overlap, and provides clean container boundaries.
 */
export function DemoLayout({ children }: DemoLayoutProps) {
  return (
    <div className="relative w-full max-w-full overflow-x-hidden min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col">
      {children}
    </div>
  );
}

export default DemoLayout;
