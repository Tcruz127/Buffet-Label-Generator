import Link from "next/link";
import { signIn } from "../../auth";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020617_0%,#0f172a_45%,#111827_100%)]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_480px]">
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 backdrop-blur">
                Welcome back to your buffet label workspace
              </div>

              <h1 className="text-5xl font-black leading-tight tracking-tight text-white">
                Sign in and pick up right where you left off.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                Reopen saved sheets, update menus, adjust allergens, and print
                polished buffet labels from your dashboard.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-cyan-500/5 backdrop-blur">
                  <p className="text-2xl font-black text-white">Saved</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Access saved sheets anytime
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-violet-500/5 backdrop-blur">
                  <p className="text-2xl font-black text-white">Fast</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Update labels in minutes
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-cyan-500/5 backdrop-blur">
                  <p className="text-2xl font-black text-white">Ready</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Print whenever you need
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
              <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/75 p-8">
                <div className="mb-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-lg font-bold text-white shadow-lg shadow-cyan-500/30">
                    BL
                  </div>

                  <h1 className="mt-5 text-3xl font-black tracking-tight text-white">
                    Sign in
                  </h1>

                  <p className="mt-2 text-sm text-slate-300">
                    Access your dashboard and manage your label sheets.
                  </p>
                </div>

                <form
                  action={async (formData) => {
                    "use server";

                    await signIn("credentials", {
                      email: formData.get("email"),
                      password: formData.get("password"),
                      redirectTo: "/app",
                    });
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                      required
                    />
                  </div>

                  <button className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-[1.01]">
                    Sign in
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-300">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Professional buffet labeling for hospitality teams
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}