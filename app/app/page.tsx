export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import UpgradeButton from "./UpgradeButton";
import ManageBillingButton from "./ManageBillingButton";
import SheetActionsMenu from "./SheetActionsMenu";

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

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Your Sheets
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Create, edit, and manage buffet label sheets for your events.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                isPro
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-neutral-200 text-neutral-700"
              }`}
            >
              {isPro ? "Pro Plan" : "Free Plan"}
            </span>

            <Link
              href="/app/new"
              className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-100"
            >
              New Sheet
            </Link>

            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-100">
                <span className="max-w-[140px] truncate">{displayName}</span>
                <svg
                  className="ml-2 h-4 w-4 text-neutral-500 transition group-open:rotate-180"
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

              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
                <div className="border-b border-neutral-100 px-3 py-2">
                  <div className="truncate text-sm font-medium text-neutral-900">
                    {user.name || "Your Account"}
                  </div>
                  <div className="truncate text-xs text-neutral-500">
                    {user.email}
                  </div>
                </div>

                <div className="p-2">
                  {isPro ? (
                    <ManageBillingButton />
                  ) : (
                    <UpgradeButton />
                  )}
                </div>

                <div className="p-2 pt-0">
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/login" });
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-100"
                    >
                      Log Out
                    </button>
                  </form>
                </div>
              </div>
            </details>
          </div>
        </div>

        {user.sheets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">
              No sheets yet
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Create your first buffet label sheet to get started.
            </p>

            <div className="mt-6">
              <Link
                href="/app/new"
                className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Create Your First Sheet
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {user.sheets.map((sheet: any) => (
              <div
                key={sheet.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-neutral-900">
                      {sheet.title || "Untitled Sheet"}
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                      {sheet.eventName || "No event name"}
                    </p>
                  </div>

                  <SheetActionsMenu
                    sheetId={sheet.id}
                    sheetTitle={sheet.title}
                  />
                </div>

                <div className="space-y-1 text-sm text-neutral-600">
                  <p>Total labels: {sheet.totalLabels}</p>
                  <p>
                    Updated:{" "}
                    {new Date(sheet.updatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/app/sheet/${sheet.id}/editor`}
                    className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Open Editor
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