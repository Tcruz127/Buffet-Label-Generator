export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getLibrary, getMenuWorkspace } from "@/lib/menus";
import LibraryManager from "./LibraryManager";

export default async function DishLibraryPage() {
  const ws = await getMenuWorkspace();
  if (!ws) redirect("/login");
  if (!ws.isPro) redirect("/app/menus");

  const library = await getLibrary(ws);

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fbff_0%,#f6f8fc_45%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        <Link href="/app/menus" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
          ← Menus
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Dish Library</h1>
        <p className="mt-2 mb-8 max-w-2xl text-sm text-slate-500">
          These are the options staff can pick from when building a menu. Changes here apply to new picks only —
          menus you&apos;ve already built keep their dishes as they were.
        </p>
        <LibraryManager initialLibrary={library} />
      </div>
    </main>
  );
}
