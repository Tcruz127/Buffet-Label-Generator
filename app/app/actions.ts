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
