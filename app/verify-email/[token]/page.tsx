import Image from "next/image";
import Link from "next/link";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { prisma } = await import("@/lib/prisma");
  const db = prisma as any;

  const record = await db.emailVerifyToken.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  });

  let success = false;

  if (record && new Date(record.expiresAt) >= new Date()) {
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });

    await db.emailVerifyToken.delete({ where: { token } });

    success = true;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020617_0%,#0f172a_45%,#111827_100%)]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mx-auto w-full rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/75 p-8 text-center">
              <div className="flex justify-center">
                <Image src="/logo-light.svg" alt="Instabels" width={160} height={30} priority />
              </div>

              <div className={`mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full ${success ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                {success ? (
                  <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h1 className="mt-6 text-3xl font-black tracking-tight text-white">
                {success ? "Email verified!" : "Link expired"}
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                {success
                  ? "Your email has been verified. You're all set."
                  : "This verification link has expired or is invalid. You can request a new one from your dashboard."}
              </p>

              <div className="mt-8">
                <Link
                  href={success ? "/app" : "/app"}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-[1.01]"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
