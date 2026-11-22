export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignageWorkspace, parseSigns, workspaceWhere } from "@/lib/signs";
import { createSignSet } from "./actions";
import SignSetRowActions from "./SignSetRowActions";

export default async function SignsPage() {
  const ws = await getSignageWorkspace();
  if (!ws) redirect("/app");

  const signSets = await prisma.signSet.findMany({
    where: workspaceWhere(ws),
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, signs: true, updatedAt: true },
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fbff_0%,#f6f8fc_45%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <Link href="/app" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
          ← Dashboard
        </Link>

        <div className="mb-8 mt-4 rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] xl:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Directional Signage</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                One set per group: write the text once, then add a sign for each arrow direction you need.
              </p>
            </div>
            <form action={createSignSet}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
              >
                + New sign set
              </button>
            </form>
          </div>
        </div>

        {signSets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
            <h2 className="text-lg font-bold text-slate-900">No signs yet</h2>
            <p className="mt-1 text-sm text-slate-500">Click &ldquo;New sign set&rdquo; to make your first one.</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signSets.map((set) => {
              const signs = parseSigns(set.signs);
              const pages = signs.reduce((sum, s) => sum + s.copies, 0);
              return (
                <li key={set.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <Link href={`/app/signs/${set.id}`} className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-slate-950">{set.title}</h3>
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      {signs.length} {signs.length === 1 ? "sign" : "signs"} · {pages} {pages === 1 ? "page" : "pages"}
                    </p>
                  </Link>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-400">
                      Updated {set.updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <SignSetRowActions signSetId={set.id} title={set.title} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
