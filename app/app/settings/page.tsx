export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { updateName, updateEmail, updatePassword } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const { prisma } = await import("@/lib/prisma");
  const user = await (prisma as any).user.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true },
  });
  if (!user) redirect("/login");

  const resolved = searchParams ? await searchParams : undefined;
  const updated = resolved?.updated ?? "";
  const rawError = resolved?.error ?? "";
  const [errorField, errorMsg] = rawError.includes(":")
    ? rawError.split(":") as [string, string]
    : ["", ""];

  function SuccessBanner({ field }: { field: string }) {
    if (updated !== field) return null;
    const messages: Record<string, string> = {
      name: "Name updated successfully.",
      email: "Email updated. Please verify your new address.",
      password: "Password changed successfully.",
    };
    return (
      <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        {messages[field] ?? "Saved."}
      </div>
    );
  }

  function ErrorBanner({ field }: { field: string }) {
    if (errorField !== field || !errorMsg) return null;
    return (
      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
        {decodeURIComponent(errorMsg)}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fbff_0%,#f6f8fc_45%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-2xl px-6 py-10 lg:px-8">

        {/* Back link */}
        <Link
          href="/app"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Account Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your name, email, and password.</p>
        </div>

        <div className="space-y-6">

          {/* Name */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <h2 className="mb-1 text-lg font-bold text-slate-950">Name</h2>
            <p className="mb-5 text-sm text-slate-500">This is how your name appears across the app.</p>
            <SuccessBanner field="name" />
            <ErrorBanner field="name" />
            <form action={updateName} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={user.name ?? ""}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Save
              </button>
            </form>
          </div>

          {/* Email */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <h2 className="mb-1 text-lg font-bold text-slate-950">Email Address</h2>
            <p className="mb-5 text-sm text-slate-500">Your login email. Changing it will require re-verification.</p>
            <SuccessBanner field="email" />
            <ErrorBanner field="email" />
            <form action={updateEmail} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email ?? ""}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Save
              </button>
            </form>
          </div>

          {/* Password */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <h2 className="mb-1 text-lg font-bold text-slate-950">Password</h2>
            <p className="mb-5 text-sm text-slate-500">Choose a strong password with at least 8 characters.</p>
            <SuccessBanner field="password" />
            <ErrorBanner field="password" />
            <form action={updatePassword} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Current password</label>
                <input
                  name="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
                <input
                  name="newPassword"
                  type="password"
                  placeholder="At least 8 characters"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}