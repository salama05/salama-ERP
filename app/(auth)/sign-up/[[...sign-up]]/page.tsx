import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center lg:text-left">
        <p className="section-kicker mx-auto w-fit lg:mx-0">Create account</p>
        <h1 className="text-3xl font-bold tracking-tight">Start using Salama ERP</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Set up your merchant workspace in minutes.
        </p>
      </div>
      <SignUp />
    </div>
  );
}
