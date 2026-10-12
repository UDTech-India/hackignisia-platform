"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const code = searchParams.get("code");
    const urlError = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (urlError) {
      setError(
        errorDescription ||
          "The password reset link is invalid or has expired. Please request a new one."
      );
      setIsVerifying(false);
      return;
    }

    async function initSession() {
      // 1. Check if we already have an active session (e.g. from /auth/callback)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsVerifying(false);
        return;
      }

      // 2. If code is in URL, exchange it
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          // Double check if a session was established despite the error
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            setError(
              exchangeError.message ||
                "The reset link is invalid or has expired. Please request a new one."
            );
          }
        }
      } else {
        // No session and no code
        setError("No active reset session found. Please request a new password reset link.");
      }

      setIsVerifying(false);
    }

    initSession();
  }, [searchParams, supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    // Sign out to ensure clean state with new credentials
    await supabase.auth.signOut();

    setSuccess(true);
    setIsLoading(false);
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="mt-4 text-sm text-zinc-400">Verifying reset link...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
          Password updated!
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="btn-primary mt-8 inline-flex justify-center"
        >
          Proceed to Login →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <Link
        href="/login"
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
      >
        ← Back to Login
      </Link>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl">
        <div className="section-label">HackIGNISIA 2026</div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
          Create new password
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Enter your new password below. Make sure it's at least 6 characters long.
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p>{error}</p>
              <Link
                href="/forgot-password"
                className="mt-2 inline-block text-xs font-medium underline hover:text-red-300"
              >
                Request a new reset link
              </Link>
            </div>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleUpdatePassword}>
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={Boolean(error && !password)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/60 pr-10 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={Boolean(error && !confirmPassword)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/60 pr-10 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || Boolean(error && !password)}
            className="btn-primary w-full justify-center disabled:opacity-50"
          >
            {isLoading ? "Updating Password..." : "Update Password →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute bottom-[-250px] left-[-150px] h-[450px] w-[450px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
        <div className="absolute right-[-200px] top-[35%] h-[400px] w-[400px] rounded-full bg-indigo-500/[0.03] blur-[120px]" />
      </div>

      <div className="container flex min-h-screen items-center justify-center py-20 relative z-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              <p className="mt-4 text-sm text-zinc-400">Loading...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
