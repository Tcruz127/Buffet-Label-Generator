export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import UpgradeButton from "./UpgradeButton";
import ManageBillingButton from "./ManageBillingButton";
import SheetActionsMenu from "./SheetActionsMenu";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "A";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function formatUpdatedAt(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AppDashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      sheets: {
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isPro =
    user.subscriptionStatus === "active" ||
    user.subscriptionStatus === "trialing";

  const displayName =
    user.name?.trim() || user.email?.split("@")[0] || "Account";

  const initials = getInitials(user.name, user.email);
  const totalSheets = user.sheets.length;
  const totalLabels = user.sheets.reduce(
    (sum, sheet) => sum + (sheet.totalLabels || 0),
    0
  );
  const recentSheet = user.sheets[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.10),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020617_0%,#0f172a_45%,#111827_100%)]" />
      </div>

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
          <div className="border-b border-white/10 bg-white/5 px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-bold text-white shadow-lg shadow-cyan-500/30">
                  {initials}
                </div>

                <div>
                  <div className="text-sm text-slate-300">
                    Welcome back,
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                    {displayName}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    isPro
                      ? "border border-emerald-400/20 bg-emerald-400/15 text-emerald-200"
                      : "border border-white/10 bg-white/10 text-slate-200"
                  }`}
                >
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>

                <Link
                  href="/app/new"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01]"
                >
                  New Sheet
                </Link>

                <details className="group relative">
                  <summary className="flex list-none cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 shadow-lg shadow-slate-950/10 transition hover:border-cyan-300/30 hover:bg-white/15">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white ring-1 ring-white/10">
                      {initials}
                    </div>

                    <div className="hidden min-w-0 sm:block">
                      <div className="max-w-[140px] truncate text-sm font-semibold text-white">
                        {displayName}
                      </div>
                      <div className="text-xs text-slate-300">
                        {isPro ? "Pro account" : "Free account"}
                      </div>
                    </div>

                    <svg
                      className="h-4 w-4 text-slate-300 transition duration-200 group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </summary>

                  <div className="absolute right-0 z-20 mt-3 w-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/10 backdrop-blur-2xl">
                    <div className="bg-[linear-gradient(135deg,rgba(56,189,248,0.22),rgba(168,85,247,0.18))] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white ring-1 ring-white/10">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">
                            {user.name || "Your Account"}
                          </div>
                          <div className="truncate text-xs text-slate-200">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-white/10 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                          Subscription
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            isPro
                              ? "bg-emerald-400/15 text-emerald-200"
                              : "bg-white/10 text-slate-200"
                          }`}
                        >
                          {isPro ? "Pro Plan" : "Free Plan"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="[&_button]:w-full">
                        {isPro ? <ManageBillingButton /> : <UpgradeButton />}
                      </div>

                      <form
                        action={async () => {
                          "use server";
                          await signOut({ redirectTo: "/login" });
                        }}
                      >
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-white/10"
                        >
                          Log Out
                        </button>
                      </form>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-cyan-500/5 backdrop-blur">
              <p className="text-sm text-slate-300">Total Sheets</p>
              <p className="mt-2 text-3xl font-black text-white">
                {totalSheets}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                All saved buffet label sheets in your workspace
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-violet-500/5 backdrop-blur">
              <p className="text-sm text-slate-300">Total Labels</p>
              <p className="mt-2 text-3xl font-black text-white">
                {totalLabels}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Labels across all of your saved sheets
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-cyan-500/5 backdrop-blur">
              <p className="text-sm text-slate-300">Most Recent Sheet</p>
              <p className="mt-2 truncate text-lg font-bold text-white">
                {recentSheet?.title || "No sheets yet"}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {recentSheet
                  ? `Updated ${formatUpdatedAt(recentSheet.updatedAt)}`
                  : "Create your first sheet to get started"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Your Sheets
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Create, edit, and manage buffet label sheets for your events.
            </p>
          </div>
        </div>

        {user.sheets.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-10 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-white ring-1 ring-white/10">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 3.75h7.5L20.25 9.5V19.5A1.75 1.75 0 0 1 18.5 21.25h-11A1.75 1.75 0 0 1 5.75 19.5v-14A1.75 1.75 0 0 1 7.5 3.75Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.5 3.75V9.5h5.75"
                />
              </svg>
            </div>

            <h3 className="mt-6 text-2xl font-bold text-white">
              No sheets yet
            </h3>
            <p className="mt-3 text-sm text-slate-300">
              Create your first buffet label sheet to start building polished,
              printable event signage.
            </p>

            <div className="mt-8">
              <Link
                href="/app/new"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01]"
              >
                Create Your First Sheet
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {user.sheets.map((sheet: any) => (
              <div
                key={sheet.id}
                className="group rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.12] hover:shadow-cyan-500/10"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">
                      Buffet Sheet
                    </div>

                    <h3 className="truncate text-xl font-bold text-white">
                      {sheet.title || "Untitled Sheet"}
                    </h3>

                    <p className="mt-2 truncate text-sm text-slate-300">
                      {sheet.eventName || "No event name"}
                    </p>
                  </div>

                  <div className="[&_button]:border-white/10 [&_button]:bg-white/5 [&_button]:text-white [&_button]:hover:bg-white/10">
                    <SheetActionsMenu
                      sheetId={sheet.id}
                      sheetTitle={sheet.title}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Labels
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {sheet.totalLabels}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Updated
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatUpdatedAt(sheet.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <Link
                    href={`/app/sheet/${sheet.id}/editor`}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
                  >
                    Open Editor
                  </Link>

                  <Link
                    href={`/app/sheet/${sheet.id}/editor`}
                    className="text-sm font-medium text-cyan-200 transition hover:text-cyan-100"
                  >
                    Continue →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}