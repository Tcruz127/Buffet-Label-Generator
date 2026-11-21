export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getLibrary,
  getMenuWorkspace,
  parseMenuContent,
  sectionsForPackage,
  workspaceWhere,
} from "@/lib/menus";
import MenuBuilder from "./MenuBuilder";

export default async function MenuBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const ws = await getMenuWorkspace();
  if (!ws) redirect("/login");
  if (!ws.isPro) redirect("/app/menus");

  const { id } = await params;
  const menu = await prisma.platedMenu.findFirst({
    where: { id, ...workspaceWhere(ws) },
  });
  if (!menu) notFound();

  const library = await getLibrary(ws);

  return (
    <MenuBuilder
      menu={{
        id: menu.id,
        welcomeText: menu.welcomeText,
        hostName: menu.hostName,
        eventDate: menu.eventDate,
        logoData: menu.logoData,
        content: parseMenuContent(menu.content),
      }}
      packageId={menu.packageId}
      packageName={library.packages.find((p) => p.id === menu.packageId)?.name ?? null}
      library={sectionsForPackage(library, menu.packageId)}
    />
  );
}
