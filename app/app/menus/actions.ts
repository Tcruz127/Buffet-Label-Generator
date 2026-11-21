"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MENU_DESIGN,
  getLibrary,
  getMenuWorkspace,
  parseMenuContent,
  sectionsForPackage,
  workspaceWhere,
  type MenuContent,
  type MenuWorkspace,
} from "@/lib/menus";

async function requireProWorkspace(): Promise<MenuWorkspace> {
  const ws = await getMenuWorkspace();
  if (!ws) redirect("/login");
  if (!ws.isPro) throw new Error("The menu builder is a Pro feature.");
  return ws;
}

async function requireMenu(ws: MenuWorkspace, menuId: string) {
  const menu = await prisma.platedMenu.findFirst({
    where: { id: menuId, ...workspaceWhere(ws) },
  });
  if (!menu) throw new Error("Menu not found.");
  return menu;
}

async function requireSection(ws: MenuWorkspace, sectionId: string) {
  const section = await prisma.menuSection.findFirst({
    where: { id: sectionId, ...workspaceWhere(ws) },
  });
  if (!section) throw new Error("Section not found.");
  return section;
}

async function requirePackage(ws: MenuWorkspace, packageId: string) {
  const menuPackage = await prisma.menuPackage.findFirst({
    where: { id: packageId, ...workspaceWhere(ws) },
  });
  if (!menuPackage) throw new Error("Menu type not found.");
  return menuPackage;
}

async function requireDish(ws: MenuWorkspace, dishId: string) {
  const dish = await prisma.menuDish.findFirst({
    where: { id: dishId, section: workspaceWhere(ws) },
  });
  if (!dish) throw new Error("Dish not found.");
  return dish;
}

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// ── Menus ──────────────────────────────────────────────────────────────

export async function createMenu(formData: FormData) {
  const ws = await requireProWorkspace();
  const library = await getLibrary(ws);

  const requested = formData.get("packageId");
  const packageId =
    typeof requested === "string" && library.packages.some((p) => p.id === requested)
      ? requested
      : null;

  const content: MenuContent = {
    design: DEFAULT_MENU_DESIGN,
    sections: sectionsForPackage(library, packageId).map((s) => ({
      sectionId: s.id,
      name: s.name,
      dishes: [],
    })),
  };

  const menu = await prisma.platedMenu.create({
    data: {
      userId: ws.userId,
      organizationId: ws.organizationId,
      packageId,
      content,
    },
  });

  redirect(`/app/menus/${menu.id}`);
}

export async function saveMenu(
  menuId: string,
  data: { welcomeText: string; hostName: string; eventDate: string | null; content: MenuContent }
) {
  const ws = await requireProWorkspace();
  await requireMenu(ws, menuId);

  const hostName = clean(data.hostName, 200);
  const eventDate =
    typeof data.eventDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.eventDate)
      ? data.eventDate
      : null;

  await prisma.platedMenu.update({
    where: { id: menuId },
    data: {
      title: hostName || "Untitled Menu",
      welcomeText: clean(data.welcomeText, 200),
      hostName,
      eventDate,
      content: parseMenuContent(data.content),
    },
  });

  return { savedAt: new Date().toISOString() };
}

export async function duplicateMenu(menuId: string) {
  const ws = await requireProWorkspace();
  const menu = await requireMenu(ws, menuId);

  const copy = await prisma.platedMenu.create({
    data: {
      userId: ws.userId,
      organizationId: ws.organizationId,
      packageId: menu.packageId,
      title: `${menu.title} (copy)`,
      welcomeText: menu.welcomeText,
      hostName: menu.hostName,
      eventDate: menu.eventDate,
      content: parseMenuContent(menu.content),
    },
  });

  redirect(`/app/menus/${copy.id}`);
}

export async function deleteMenu(menuId: string) {
  const ws = await requireProWorkspace();
  await requireMenu(ws, menuId);
  await prisma.platedMenu.delete({ where: { id: menuId } });
  revalidatePath("/app/menus");
}

// ── Menu types (packages) ──────────────────────────────────────────────

export async function createPackage(name: string) {
  const ws = await requireProWorkspace();
  const packageName = clean(name, 100);
  if (!packageName) throw new Error("Menu type name is required.");

  const last = await prisma.menuPackage.findFirst({
    where: workspaceWhere(ws),
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const menuPackage = await prisma.menuPackage.create({
    data: {
      userId: ws.userId,
      organizationId: ws.organizationId,
      name: packageName,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
    select: { id: true, name: true, sortOrder: true },
  });
  revalidatePath("/app/menus", "layout");
  return menuPackage;
}

export async function renamePackage(packageId: string, name: string) {
  const ws = await requireProWorkspace();
  await requirePackage(ws, packageId);
  const packageName = clean(name, 100);
  if (!packageName) throw new Error("Menu type name is required.");

  await prisma.menuPackage.update({ where: { id: packageId }, data: { name: packageName } });
  revalidatePath("/app/menus", "layout");
}

/** Deletes a menu type and its sections/dishes. Menus already built keep their content. */
export async function deletePackage(packageId: string) {
  const ws = await requireProWorkspace();
  await requirePackage(ws, packageId);
  await prisma.menuPackage.delete({ where: { id: packageId } });
  revalidatePath("/app/menus", "layout");
}

// ── Dish library ───────────────────────────────────────────────────────

export async function createSection(name: string, packageId: string | null) {
  const ws = await requireProWorkspace();
  if (packageId) await requirePackage(ws, packageId);
  const sectionName = clean(name, 100).toUpperCase();
  if (!sectionName) throw new Error("Section name is required.");

  const last = await prisma.menuSection.findFirst({
    where: { ...workspaceWhere(ws), packageId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const section = await prisma.menuSection.create({
    data: {
      userId: ws.userId,
      organizationId: ws.organizationId,
      packageId,
      name: sectionName,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  revalidatePath("/app/menus/library");
  return {
    id: section.id,
    packageId: section.packageId,
    name: section.name,
    sortOrder: section.sortOrder,
    dishes: [],
  };
}

export async function renameSection(sectionId: string, name: string) {
  const ws = await requireProWorkspace();
  await requireSection(ws, sectionId);
  const sectionName = clean(name, 100).toUpperCase();
  if (!sectionName) throw new Error("Section name is required.");

  await prisma.menuSection.update({ where: { id: sectionId }, data: { name: sectionName } });
  revalidatePath("/app/menus/library");
}

export async function deleteSection(sectionId: string) {
  const ws = await requireProWorkspace();
  await requireSection(ws, sectionId);
  await prisma.menuSection.delete({ where: { id: sectionId } });
  revalidatePath("/app/menus/library");
}

/** Saves a new section order; ids not in this workspace are ignored. */
export async function reorderSections(sectionIds: string[]) {
  const ws = await requireProWorkspace();
  const owned = await prisma.menuSection.findMany({
    where: { id: { in: sectionIds }, ...workspaceWhere(ws) },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((s) => s.id));

  await prisma.$transaction(
    sectionIds
      .filter((id) => ownedIds.has(id))
      .map((id, index) =>
        prisma.menuSection.update({ where: { id }, data: { sortOrder: index } })
      )
  );
  revalidatePath("/app/menus/library");
}

export async function createDish(sectionId: string, name: string, description: string) {
  const ws = await requireProWorkspace();
  await requireSection(ws, sectionId);
  const dishName = clean(name, 200);
  if (!dishName) throw new Error("Dish name is required.");

  const last = await prisma.menuDish.findFirst({
    where: { sectionId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const dish = await prisma.menuDish.create({
    data: {
      sectionId,
      name: dishName,
      description: clean(description, 1000),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
    select: { id: true, name: true, description: true, sortOrder: true },
  });
  revalidatePath("/app/menus/library");
  return dish;
}

export async function updateDish(dishId: string, name: string, description: string) {
  const ws = await requireProWorkspace();
  await requireDish(ws, dishId);
  const dishName = clean(name, 200);
  if (!dishName) throw new Error("Dish name is required.");

  await prisma.menuDish.update({
    where: { id: dishId },
    data: { name: dishName, description: clean(description, 1000) },
  });
  revalidatePath("/app/menus/library");
}

export async function deleteDish(dishId: string) {
  const ws = await requireProWorkspace();
  await requireDish(ws, dishId);
  await prisma.menuDish.delete({ where: { id: dishId } });
  revalidatePath("/app/menus/library");
}
