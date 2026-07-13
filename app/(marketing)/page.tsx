import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, ShieldCheck, Sparkles } from "lucide-react";

export default function MarketingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <div className="hero-orb -left-24 top-16" />
      <div className="hero-orb right-[-8rem] top-[28rem]" />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-12 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="section-kicker w-fit">
              <Sparkles className="h-4 w-4" />
              Retail and wholesale in one shell
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight text-balance md:text-6xl lg:text-7xl">
                A sharper operating system for merchants.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] md:text-lg">
                Run products, invoices, customers, suppliers, POS, finance, and analytics from one polished multi-tenant workspace built for speed, clarity, and RTL support.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(99,102,241,0.24)] transition hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5"
              >
                Start free
                <ArrowRight className="h-4 w-4 rtl-flip" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-6 py-3.5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-hover)]"
              >
                Open dashboard
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: "Inventory", copy: "Clear stock signals and reorder control.", icon: Boxes },
                { title: "Revenue", copy: "Live sales and margin visibility.", icon: BarChart3 },
                { title: "Trust", copy: "Role gates and tenant separation.", icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="surface-panel p-4">
                    <Icon className="h-5 w-5 text-[var(--color-brand-light)]" />
                    <h2 className="mt-3 text-sm font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="soft-grid surface-panel relative overflow-hidden p-5 shadow-2xl shadow-black/20">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[rgba(99,102,241,0.14)] to-transparent" />
              <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Operations snapshot</p>
                  <p className="mt-1 text-lg font-semibold">Salama Control Center</p>
                </div>
                <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                  Live
                </div>
              </div>

              <div className="grid gap-4 py-5 sm:grid-cols-2">
                {[
                  ["Monthly revenue", "DZD 125,430"],
                  ["Orders today", "84"],
                  ["Low stock items", "23"],
                  ["Margin", "32.4%"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-[var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(24,24,27,0.96))] p-5">
                <p className="text-sm font-semibold text-white">Designed for RTL, FR, and EN from day one.</p>
                <p className="mt-2 max-w-md text-sm text-white/75">
                  Keep the code small, the surfaces calm, and the daily workflows obvious.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
