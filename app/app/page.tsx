export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import UpgradeButton from "./UpgradeButton";
import ManageBillingButton from "./ManageBillingButton";
import SheetActionsMenu from "./SheetActionsMenu";
import CreateOrgButton from "./CreateOrgButton";
import FolderBar from "./FolderBar";
import { isOrgProUser } from "@/lib/plan";
import { resendVerificationEmail } from "./resendVerification";
import OnboardingModal from "./OnboardingModal";

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

export default async function AppDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ folder?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedFolderId = resolvedSearchParams?.folder ?? null;

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { prisma } = await import("@/lib/prisma");

  const user = await (prisma as any).user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionStatus: true,
      emailVerified: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch org memberships separately using a cast so existing Prisma client
  // types are unaffected by the new schema additions.
  const db = prisma as any;

  const memberships: {
    role: string;
    organization: {
      id: string;
      name: string;
      members: { role: string; user: { subscriptionStatus: string | null } }[];
    };
  }[] = await db.organizationMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          members: {
            include: {
              user: { select: { subscriptionStatus: true } },
            },
          },
        },
      },
    },
  });

  const isPro = isOrgProUser(user.subscriptionStatus, memberships);

  const orgMembership = memberships[0] ?? null;
  const org = orgMembership?.organization ?? null;
  const isOrgOwner = orgMembership?.role === "owner";

  // Fetch folders scoped to org or user
  const folders: { id: string; name: string }[] = await db.sheetFolder.findMany({
    where: org ? { organizationId: org.id } : { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  // Validate selectedFolderId belongs to this workspace
  const activeFolderId =
    selectedFolderId && folders.some((f: { id: string }) => f.id === selectedFolderId)
      ? selectedFolderId
      : null;

  // Org members share the org's sheet workspace.
  const sheetWhere = org
    ? {
        organizationId: org.id,
        ...(activeFolderId ? { folderId: activeFolderId } : {}),
      }
    : {
        userId: user.id,
        ...(activeFolderId ? { folderId: activeFolderId } : {}),
      };

  const sheets: { id: string; title: string; eventName: string | null; totalLabels: number; updatedAt: Date; folderId: string | null }[] =
    await db.labelSheet.findMany({
      where: sheetWhere,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, eventName: true, totalLabels: true, updatedAt: true, folderId: true },
    });

  const displayName =
    user.name?.trim() || user.email?.split("@")[0] || "Account";

  const initials = getInitials(user.name, user.email);

  // Stats always reflect full workspace (not filtered view)
  const allSheets: { totalLabels: number; updatedAt: Date; title: string }[] =
    await db.labelSheet.findMany({
      where: org ? { organizationId: org.id } : { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { totalLabels: true, updatedAt: true, title: true },
    });

  const totalSheets = allSheets.length;
  const totalLabels = allSheets.reduce(
    (sum: number, sheet: { totalLabels: number }) => sum + (sheet.totalLabels || 0),
    0
  );
  const recentSheet = allSheets[0];
  const recentUpdatedLabel = recentSheet
    ? formatUpdatedAt(recentSheet.updatedAt)
    : "No recent activity";

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fbff_0%,#f6f8fc_45%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {!user.emailVerified && (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-amber-800">
                Please verify your email address to secure your account.
              </p>
            </div>
            <form action={resendVerificationEmail}>
              <button type="submit" className="shrink-0 rounded-full border border-amber-300 bg-white px-4 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-50">
                Resend email
              </button>
            </form>
          </div>
        )}

        <div className="relative z-10 mb-8 rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4">
                <Image src="/logo-dark.svg" alt="Instabels" width={200} height={37} />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Welcome back, {displayName}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Create, organize, and edit buffet label sheets for weddings,
                corporate events, catering jobs, and hospitality teams.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/app/new"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
                >
                  Create New Sheet
                </Link>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    isPro
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>

                {org && (
                  <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                    {org.name}
                  </span>
                )}

                {isOrgOwner && (
                  <Link
                    href="/app/org/settings"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Manage Team
                  </Link>
                )}

                {isPro && !org && <CreateOrgButton />}
              </div>
            </div>

            <details className="group relative z-40 shrink-0 self-start">
              <summary className="flex list-none cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-bold text-white">
                  {initials}
                </div>

                <div className="hidden min-w-0 sm:block">
                  <div className="max-w-[160px] truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isPro ? "Pro account" : "Free account"}
                  </div>
                </div>

                <svg
                  className="h-4 w-4 text-slate-500 transition group-open:rotate-180"
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

              <div className="absolute right-0 z-40 mt-3 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                <div className="bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(168,85,247,0.10))] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-semibold text-white">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {user.name || "Your Account"}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                      Subscription
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        isPro
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {isPro ? "Pro Plan" : "Free Plan"}
                    </span>
                  </div>
                </div>

                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                    Account
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                        Name
                      </div>
                      <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {displayName}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                        Email
                      </div>
                      <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                    Usage
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-3 py-3">
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-700">
                        Sheets
                      </div>
                      <div className="mt-1 text-lg font-black text-slate-950">
                        {totalSheets}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-violet-50/70 px-3 py-3">
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-violet-700">
                        Labels
                      </div>
                      <div className="mt-1 text-lg font-black text-slate-950">
                        {totalLabels}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      Recent Activity
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                      {recentSheet?.title || "No sheets yet"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {recentUpdatedLabel}
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                    Support
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
                  >
                    Contact Support
                  </Link>
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
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
                    >
                      Log Out
                    </button>
                  </form>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5">
              <p className="text-sm font-medium text-cyan-700">Total Sheets</p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {totalSheets}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Saved buffet label sheets in your workspace
              </p>
            </div>

            <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5">
              <p className="text-sm font-medium text-violet-700">Total Labels</p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {totalLabels}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Labels across all saved sheets
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-sm font-medium text-slate-700">
                Most Recent Sheet
              </p>
              <p className="mt-2 truncate text-lg font-bold text-slate-950">
                {recentSheet?.title || "No sheets yet"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {recentSheet
                  ? `Updated ${formatUpdatedAt(recentSheet.updatedAt)}`
                  : "Create your first sheet to get started"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              {org ? `${org.name} Sheets` : "Your Sheets"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {org
                ? "Shared sheets visible to everyone on your team."
                : "Open and manage your saved buffet label projects."}
            </p>
          </div>
        </div>

        <FolderBar folders={folders} selectedFolderId={activeFolderId} />

        {sheets.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-violet-100 text-slate-700">
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

            <h3 className="mt-6 text-2xl font-bold text-slate-950">
              No sheets yet
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Create your first buffet label sheet to start building polished,
              printable event signage.
            </p>

            <div className="mt-8">
              <Link
                href="/app/new"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
              >
                Create Your First Sheet
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {sheets.map((sheet: any) => (
              <div
                key={sheet.id}
                className="group rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(34,211,238,0.12)]"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Buffet Sheet
                    </div>

                    <h3 className="truncate text-xl font-bold text-slate-950">
                      {sheet.title || "Untitled Sheet"}
                    </h3>

                    <p className="mt-2 truncate text-sm text-slate-600">
                      {sheet.eventName || "No event name"}
                    </p>
                  </div>

                  <div className="[&_button]:border-slate-200 [&_button]:bg-white [&_button]:text-slate-700 [&_button]:hover:bg-slate-50">
                    <SheetActionsMenu
                      sheetId={sheet.id}
                      sheetTitle={sheet.title}
                      folderId={sheet.folderId}
                      folders={folders}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Labels
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-950">
                      {sheet.totalLabels}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Updated
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {formatUpdatedAt(sheet.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <Link
                    href={`/app/sheet/${sheet.id}/editor`}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:scale-[1.01]"
                  >
                    Open Editor
                  </Link>

                  <Link
                    href={`/app/sheet/${sheet.id}/editor`}
                    className="text-sm font-medium text-cyan-700 transition hover:text-cyan-600"
                  >
                    Continue →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalSheets === 0 && (
        <OnboardingModal userName={displayName} />
      )}
    </main>
  );
}