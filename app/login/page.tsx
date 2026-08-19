import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black text-white">
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

            <form className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Email Address
                </label>

                <input
                  type="email"
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

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/60"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center"
              >
                Login →
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-zinc-600">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.05]"
            >
              Continue with Google
            </button>

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