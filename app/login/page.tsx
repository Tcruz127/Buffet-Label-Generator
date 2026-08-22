import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "../../auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; redirect?: string; success?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const error = resolvedSearchParams?.error;
  const success = resolvedSearchParams?.success;
  const rawRedirect = resolvedSearchParams?.redirect ?? "";
  const callbackUrl = rawRedirect.startsWith("/") ? rawRedirect : "";

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
                Welcome back to your buffet label workspace
              </div>

              <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-950">
                Sign in and pick up right where you left off.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Reopen saved sheets, update menus, adjust allergens, and print
                polished buffet labels from your dashboard.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
                  <p className="text-2xl font-black text-slate-950">Saved</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Access saved sheets anytime
                  </p>
                </div>

                <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
                  <p className="text-2xl font-black text-slate-950">Fast</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Update labels in minutes
                  </p>
                </div>

                <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
                  <p className="text-2xl font-black text-slate-950">Ready</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Print whenever you need
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
                    Sign in
                  </h1>

                  <p className="mt-2 text-sm text-slate-600">
                    Access your dashboard and manage your label sheets.
                  </p>
                </div>

                {success === "1" && (
                  <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
                    <p className="text-sm font-semibold text-emerald-700">Account created successfully!</p>
                    <p className="mt-1 text-xs text-emerald-600">Sign in below to access your dashboard.</p>
                  </div>
                )}

                {error === "invalid" && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Invalid email or password.
                  </div>
                )}

                <form
  action={async (formData) => {
    "use server";

    const email = formData.get("email");
    const password = formData.get("password");
    const raw = formData.get("callbackUrl");
    const redirectTo =
      typeof raw === "string" && raw.startsWith("/") ? raw : "/app";

    await signOut({ redirect: false });

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      redirect(redirectTo);
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.type === "CredentialsSignin") {
          const errorRedirect = callbackUrl
            ? `/login?error=invalid&redirect=${encodeURIComponent(callbackUrl)}`
            : "/login?error=invalid";
          redirect(errorRedirect);
        }
      }

      throw error;
    }
  }}

                  className="space-y-5"
                >
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
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-cyan-600 transition hover:text-cyan-700"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                      required
                    />
                  </div>

                  {callbackUrl && (
                    <input type="hidden" name="callbackUrl" value={callbackUrl} />
                  )}

                  <button className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-[1.01]">
                    Sign in
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={callbackUrl ? `/signup?redirect=${encodeURIComponent(callbackUrl)}` : "/signup"}
                    className="font-semibold text-cyan-600 transition hover:text-cyan-700"
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