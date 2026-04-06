import Image from "next/image";
import Link from "next/link";
import { forgotPasswordAction } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ sent?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const sent = params?.sent === "1";

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
                  {sent ? "Check your email" : "Forgot password?"}
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                  {sent
                    ? "If that email is registered, we've sent a reset link. It expires in 1 hour."
                    : "Enter your email and we'll send you a reset link."}
                </p>
              </div>

              {!sent && (
                <form action={forgotPasswordAction} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                    />
                  </div>

                  <button className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-[1.01]">
                    Send Reset Link
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-slate-300">
                <Link href="/login" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
                  Back to sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
