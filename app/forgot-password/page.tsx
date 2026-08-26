"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="container flex min-h-screen items-center justify-center py-20">
          <div className="w-full max-w-lg text-center">
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Check your email
            </h1>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              We've sent a password reset link to {email}.
            </p>
            <Link
              href="/login"
              className="btn-primary mt-8 inline-flex justify-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container flex min-h-screen items-center justify-center py-20">
        <div className="w-full max-w-lg">
          <Link
            href="/login"
            className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            ← Back to Login
          </Link>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
            <div className="section-label">HackIGNISIA 2026</div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Reset Password
            </h1>

            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/60"
                />
              </div>

              {error && (
                <div className="text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Reset Link →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
