export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-base)] px-4 py-8 text-[var(--color-text-primary)]">
      <div className="hero-orb left-[-10rem] top-[-6rem]" />
      <div className="hero-orb right-[-8rem] bottom-[-8rem]" />

      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="surface-panel relative hidden overflow-hidden p-8 lg:block">
          <div className="absolute inset-0 soft-grid opacity-30" />
          <div className="relative space-y-6">
            <div className="section-kicker w-fit">Salama ERP</div>
            <div className="space-y-4">
              <h1 className="max-w-sm text-4xl font-bold tracking-tight">
                A calm, efficient workspace for merchants.
              </h1>
              <p className="max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
                Sign in once and move across products, invoices, customers, and
                finance with a single operating rhythm.
              </p>
            </div>

            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              {[
                ["Retail + wholesale", "Two commercial modes, one interface."],
                ["RTL ready", "Arabic layouts and localized navigation."],
                ["Multi-tenant", "Clear separation with role-aware access."],
                ["Zero-friction", "Simple flows for a solo operator."],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4"
                >
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
