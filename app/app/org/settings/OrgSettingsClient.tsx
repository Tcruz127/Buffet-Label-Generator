"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type Props = {
  orgId: string;
  orgName: string;
  currentUserId: string;
  members: Member[];
};

export default function OrgSettingsClient({
  orgName,
  currentUserId,
  members: initialMembers,
}: Props) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [acceptUrl, setAcceptUrl] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    setAcceptUrl(null);
    setInviteError(null);

    try {
      const res = await fetch("/api/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error || "Failed to create invite.");
        return;
      }

      setAcceptUrl(data.acceptUrl);
      setInviteEmail("");
    } catch {
      setInviteError("Something went wrong. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);

    try {
      const res = await fetch(`/api/org/members/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to remove member.");
        return;
      }

      setMembers((prev) => prev.filter((m) => m.id !== userId));
      router.refresh();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fbff_0%,#f6f8fc_45%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        <div className="mb-6">
          <Link
            href="/app"
            className="text-sm font-medium text-cyan-700 hover:text-cyan-600"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-1 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Organization
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {orgName}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your team members and send invitations.
          </p>
        </div>

        {/* Members */}
        <div className="mb-6 rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="mb-5 text-xl font-black tracking-tight text-slate-950">
            Team Members
          </h2>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {member.name || member.email}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {member.email}
                  </p>
                </div>

                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                      member.role === "owner"
                        ? "bg-cyan-100 text-cyan-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {member.role}
                  </span>

                  {member.id !== currentUserId && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      disabled={removingId === member.id}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {removingId === member.id ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite */}
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <h2 className="mb-2 text-xl font-black tracking-tight text-slate-950">
            Invite a Team Member
          </h2>
          <p className="mb-5 text-sm text-slate-600">
            Enter their email address to generate an invite link. Send them the
            link and they will be added to your organization when they click it.
          </p>

          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              required
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
            <button
              type="submit"
              disabled={inviteLoading}
              className="shrink-0 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {inviteLoading ? "Creating..." : "Send Invite"}
            </button>
          </form>

          {inviteError && (
            <p className="mt-3 text-sm text-red-600">{inviteError}</p>
          )}

          {acceptUrl && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="mb-2 text-sm font-semibold text-emerald-800">
                Invite link created — copy and send this to your teammate:
              </p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-700">
                  {acceptUrl}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(acceptUrl)}
                  className="shrink-0 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
