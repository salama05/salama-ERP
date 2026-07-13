import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center lg:text-left">
        <p className="section-kicker mx-auto w-fit lg:mx-0">Welcome back</p>
        <h1 className="text-3xl font-bold tracking-tight">Sign in to Salama ERP</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Continue to your dashboard, operations, and analytics workspace.
        </p>
      </div>
      <SignIn />
    </div>
  );
}
