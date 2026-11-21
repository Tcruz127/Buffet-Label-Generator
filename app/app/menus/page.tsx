export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatMenuDate,
  getLibrary,
  getMenuWorkspace,
  parseMenuContent,
  workspaceWhere,
} from "@/lib/menus";
import { createMenu } from "./actions";
import MenuRowActions from "./MenuRowActions";
import UpgradeModalButton from "../UpgradeModalButton";

export default async function MenusPage() {
  const ws = await getMenuWorkspace();
  if (!ws) redirect("/login");

  const [menus, library] = ws.isPro
    ? await Promise.all([
        prisma.platedMenu.findMany({
          where: workspaceWhere(ws),
          orderBy: { updatedAt: "desc" },
          include: { package: { select: { name: true } } },
          omit: { logoData: true },
        }),
        getLibrary(ws),
      ])
    : [[], null];

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fbff_0%,#f6f8fc_45%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <Link href="/app" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
          ← Dashboard
        </Link>

        <div className="mt-4 mb-8 rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] xl:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Pro feature
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Plated Menus</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Build printed dinner menus by clicking each course and picking dishes from your library.
              </p>
            </div>

            {ws.isPro && (
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/app/menus/library"
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Dish Library
                </Link>
                <form action={createMenu} className="flex items-center gap-2">
                  {library && library.packages.length > 0 && (
                    <select
                      name="packageId"
                      aria-label="Menu type"
                      defaultValue={library.packages[0].id}
                      className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-cyan-400"
                    >
                      {library.packages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
                  >
                    + New Menu
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {!ws.isPro ? (
          <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Upgrade to build plated menus</h2>
            <p className="mt-2 text-sm text-slate-500">
              The menu builder is included with Pro. Create print-ready dinner menus from your own dish library in a few clicks.
            </p>
            <div className="mt-6">
              <UpgradeModalButton />
            </div>
          </div>
        ) : menus.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
            <h2 className="text-lg font-bold text-slate-900">No menus yet</h2>
            <p className="mt-1 text-sm text-slate-500">Click “New Menu” to build your first one.</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => {
              const content = parseMenuContent(menu.content);
              const dishCount = content.sections.reduce((sum, s) => sum + s.dishes.length, 0);
              return (
                <li
                  key={menu.id}
                  className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <Link href={`/app/menus/${menu.id}`} className="min-w-0 flex-1">
                    {menu.package && (
                      <span className="mb-2 inline-block rounded-full border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                        {menu.package.name}
                      </span>
                    )}
                    <h3 className="truncate text-lg font-bold text-slate-950">{menu.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatMenuDate(menu.eventDate) || "No date set"}
                    </p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      {content.sections.length} sections · {dishCount} {dishCount === 1 ? "dish" : "dishes"}
                    </p>
                  </Link>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-400">
                      Updated {menu.updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <MenuRowActions menuId={menu.id} />
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
