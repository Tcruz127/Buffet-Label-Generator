import Image from "next/image";
import Link from "next/link";
import { resetPasswordAction } from "./actions";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const { token } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const error = sp?.error;
  const success = sp?.success === "1";

  // Validate token exists and is not expired
  const { prisma } = await import("@/lib/prisma");
  const db = prisma as any;

  const record = await db.passwordResetToken.findUnique({
    where: { token },
    select: { expiresAt: true },
  });

  const isExpired = !record || new Date(record.expiresAt) < new Date();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020617_0%,#0f172a_45%,#111827_100%)]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mx-auto w-full rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/75 p-8">
              <div className="mb-8 text-center">
                <div className="flex justify-center">
                  <Image src="/logo-light.svg" alt="Instabels" width={160} height={30} priority />
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-tight text-white">
                  {success ? "Password updated" : "Set new password"}
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                  {success
                    ? "Your password has been reset. You can now sign in."
                    : isExpired
                    ? "This reset link has expired or is invalid."
                    : "Choose a strong new password for your account."}
                </p>
              </div>

              {!success && !isExpired && (
                <>
                  {error === "mismatch" && (
                    <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      Passwords do not match.
                    </div>
                  )}
                  {error === "short" && (
                    <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      Password must be at least 8 characters.
                    </div>
                  )}

                  <form action={resetPasswordAction} className="space-y-5">
                    <input type="hidden" name="token" value={token} />

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        New password
                      </label>
                      <input
                        name="password"
                        type="password"
                        placeholder="At least 8 characters"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">
                        Confirm new password
                      </label>
                      <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Repeat your password"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                      />
                    </div>

                    <button className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-[1.01]">
                      Update Password
                    </button>
                  </form>
                </>
              )}

              {(success || isExpired) && (
                <div className="text-center">
                  <Link
                    href={isExpired ? "/forgot-password" : "/login"}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-[1.01]"
                  >
                    {isExpired ? "Request a new link" : "Sign in"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
