"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const db = prisma as any;

async function getOrgId(userId: string): Promise<string | null> {
  const membership = await db.organizationMember.findFirst({
    where: { userId },
    select: { organizationId: true },
  });
  return membership?.organizationId ?? null;
}

async function findSheet(sheetId: string, userId: string, orgId: string | null) {
  return db.labelSheet.findFirst({
    where: {
      id: sheetId,
      OR: [
        { userId },
        ...(orgId ? [{ organizationId: orgId }] : []),
      ],
    },
    select: { id: true, userId: true, organizationId: true },
  });
}

export async function copySheet(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const sheetId = String(formData.get("sheetId") || "");
  const newTitle = String(formData.get("newTitle") || "").trim();

  if (!sheetId) {
    throw new Error("Missing sheetId");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) throw new Error("Unauthorized");

  const orgId = await getOrgId(user.id);

  const original = await db.labelSheet.findFirst({
    where: {
      id: sheetId,
      OR: [
        { userId: user.id },
        ...(orgId ? [{ organizationId: orgId }] : []),
      ],
    },
    include: { items: true },
  });

  if (!original) {
    throw new Error("Sheet not found");
  }

  await db.labelSheet.create({
    data: {
      userId: user.id,
      organizationId: original.organizationId ?? null,
      title: newTitle || `${original.title} Copy`,
      eventName: original.eventName,
      totalLabels: original.totalLabels,
      settings: original.settings ?? undefined,
      logoUrl: original.logoUrl,
      items: {
        create: original.items.map((item: any) => ({
          positionIndex: item.positionIndex,
          foodName: item.foodName,
          diets: item.diets ?? undefined,
        })),
      },
    },
  });

  revalidatePath("/app");
}

export async function renameSheet(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const sheetId = String(formData.get("sheetId") || "");
  const newTitle = String(formData.get("newTitle") || "").trim();

  if (!sheetId) throw new Error("Missing sheetId");
  if (!newTitle) throw new Error("Missing new title");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) throw new Error("Unauthorized");

  const orgId = await getOrgId(user.id);
  const sheet = await findSheet(sheetId, user.id, orgId);

  if (!sheet) {
    throw new Error("Sheet not found");
  }

  await prisma.labelSheet.update({
    where: { id: sheet.id },
    data: { title: newTitle },
  });

  revalidatePath("/app");
}

export async function deleteSheet(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const sheetId = String(formData.get("sheetId") || "");

  if (!sheetId) throw new Error("Missing sheetId");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) throw new Error("Unauthorized");

  const orgId = await getOrgId(user.id);
  const sheet = await findSheet(sheetId, user.id, orgId);

  if (!sheet) {
    throw new Error("Sheet not found");
  }

  await prisma.$transaction([
    prisma.dishAnalysis.deleteMany({ where: { sheetId: sheet.id } }),
    prisma.labelItem.deleteMany({ where: { sheetId: sheet.id } }),
    prisma.labelSheet.delete({ where: { id: sheet.id } }),
  ]);

  revalidatePath("/app");
}

// ── Folder actions ──────────────────────────────────────────────────────────

export async function createFolder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Missing folder name");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) throw new Error("Unauthorized");

  const orgId = await getOrgId(user.id);

  await db.sheetFolder.create({
    data: {
      name,
      userId: user.id,
      organizationId: orgId ?? null,
    },
  });

  revalidatePath("/app");
}

export async function renameFolder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const folderId = String(formData.get("folderId") || "");
  const name = String(formData.get("name") || "").trim();
  if (!folderId) throw new Error("Missing folderId");
  if (!name) throw new Error("Missing name");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) throw new Error("Unauthorized");

  const orgId = await getOrgId(user.id);

  const folder = await db.sheetFolder.findFirst({
    where: {
      id: folderId,
      OR: [{ userId: user.id }, ...(orgId ? [{ organizationId: orgId }] : [])],
    },
  });
  if (!folder) throw new Error("Folder not found");

  await db.sheetFolder.update({
    where: { id: folderId },
    data: { name },
  });

  revalidatePath("/app");
}

export async function deleteFolder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const folderId = String(formData.get("folderId") || "");
  if (!folderId) throw new Error("Missing folderId");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) throw new Error("Unauthorized");

  const orgId = await getOrgId(user.id);

  const folder = await db.sheetFolder.findFirst({
    where: {
      id: folderId,
      OR: [{ userId: user.id }, ...(orgId ? [{ organizationId: orgId }] : [])],
    },
  });
  if (!folder) throw new Error("Folder not found");

  // Sheets inside the folder become un-foldered (SET NULL via cascade)
  await db.sheetFolder.delete({ where: { id: folderId } });

  revalidatePath("/app");
}

export async function moveSheetToFolder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const sheetId = String(formData.get("sheetId") || "");
  const rawFolderId = formData.get("folderId");
  const folderId = rawFolderId && String(rawFolderId).trim() !== "" ? String(rawFolderId) : null;

  if (!sheetId) throw new Error("Missing sheetId");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) throw new Error("Unauthorized");

  const orgId = await getOrgId(user.id);
  const sheet = await findSheet(sheetId, user.id, orgId);
  if (!sheet) throw new Error("Sheet not found");

  if (folderId) {
    const folder = await db.sheetFolder.findFirst({
      where: {
        id: folderId,
        OR: [{ userId: user.id }, ...(orgId ? [{ organizationId: orgId }] : [])],
      },
    });
    if (!folder) throw new Error("Folder not found");
  }

  await db.labelSheet.update({
    where: { id: sheetId },
    data: { folderId },
  });

  revalidatePath("/app");
}
