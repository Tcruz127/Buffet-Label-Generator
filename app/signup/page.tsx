import Image from "next/image";
import Link from "next/link";
import { signUpAction } from "./actions";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string; error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawRedirect = resolvedSearchParams?.redirect ?? "";
  const callbackUrl = rawRedirect.startsWith("/") ? rawRedirect : "";
  const error = resolvedSearchParams?.error ?? "";
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(to_bottom,#f8fbff_0%,#f6f8fc_45%,#ffffff_100%)] text-slate-900">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.08),transparent_28%)]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_480px]">
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm text-cyan-700">
                Start building polished buffet labels today
              </div>

              <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-950">
                Create your account and launch your label workflow.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Save sheets, customize branding, manage allergens, and print
                elegant labels from a workspace designed for hospitality teams.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
                  <p className="text-2xl font-black text-slate-950">Save</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Keep every sheet organized
                  </p>
                </div>

                <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
                  <p className="text-2xl font-black text-slate-950">Style</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Add logos, colors, and fonts
                  </p>
                </div>

                <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
                  <p className="text-2xl font-black text-slate-950">Print</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Export polished labels fast
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white/85 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-8">
                <div className="mb-8 text-center">
                  <div className="flex justify-center">
                    <Image
                      src="/logo-dark.svg"
                      alt="Instabels"
                      width={160}
                      height={30}
                      priority
                    />
                  </div>

                  <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                    Create account
                  </h1>

                  <p className="mt-2 text-sm text-slate-600">
                    Get started with your buffet label workspace.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {decodeURIComponent(error)}
                  </div>
                )}

                <form action={signUpAction} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Name
                    </label>
                    <input
                      name="name"
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                      required
                    />
                    <p className="mt-1.5 text-xs text-slate-400">Minimum 8 characters</p>
                  </div>

                  {callbackUrl && (
                    <input type="hidden" name="callbackUrl" value={callbackUrl} />
                  )}

                  <button className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-[1.01]">
                    Create account
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    href={callbackUrl ? `/login?redirect=${encodeURIComponent(callbackUrl)}` : "/login"}
                    className="font-semibold text-cyan-600 transition hover:text-cyan-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Built for caterers, resorts, banquet teams, and event venues
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
