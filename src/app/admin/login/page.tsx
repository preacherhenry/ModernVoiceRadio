import type { Metadata } from "next";
import Logo from "@/components/ui/Logo";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Staff Login | Modern Voice Radio",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-10 border border-line bg-ink-2 p-7 sm:p-9">
          <p className="font-condensed text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            Staff Access
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-white">
            Sign In to the Admin Panel
          </h1>
          {reason === "session-expired" && (
            <p className="mt-4 border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-soft">
              Your session is no longer valid — please sign in again.
            </p>
          )}
          <div className="mt-7">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
