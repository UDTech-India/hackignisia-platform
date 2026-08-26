"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // Check profile completion status
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("id", data.user.id)
        .single();

      if (profile && !profile.profile_completed) {
        router.push("/dashboard/profile");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute bottom-[-250px] left-[-150px] h-[450px] w-[450px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
        <div className="absolute right-[-200px] top-[35%] h-[400px] w-[400px] rounded-full bg-indigo-500/[0.03] blur-[120px]" />
      </div>
      <div className="container flex min-h-screen items-center justify-center py-20">
        <div className="w-full max-w-lg">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            ← Back to HackIGNISIA
          </Link>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
            <div className="section-label">HackIGNISIA 2026</div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Welcome back.
            </h1>

            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Login to access your HackIGNISIA participant dashboard.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleLogin}>
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

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm text-zinc-300">
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/60 pr-10"
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
                {isLoading ? "Logging in..." : "Login →"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-zinc-600">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
              >
                {/* Google icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1818l-2.9087-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3445 0-4.3282-1.5836-5.036-3.7105H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9574C.3477 6.1732 0 7.5482 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
                  <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1632 6.6555 3.5795 9 3.5795z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleGitHubLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
              >
                {/* GitHub icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            <p className="mt-7 text-center text-sm text-zinc-500">
              Do not have an account?{" "}
              <Link
                href="/register"
                className="text-violet-400 hover:text-violet-300"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}