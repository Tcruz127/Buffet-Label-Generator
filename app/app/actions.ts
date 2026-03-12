"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

  const original = await prisma.labelSheet.findFirst({
    where: {
      id: sheetId,
      user: {
        email: session.user.email,
      },
    },
    include: {
      items: true,
    },
  });

  if (!original) {
    throw new Error("Sheet not found");
  }

  await prisma.labelSheet.create({
    data: {
      userId: original.userId,
      title: newTitle || `${original.title} Copy`,
      eventName: original.eventName,
      totalLabels: original.totalLabels,
      settings: original.settings ?? undefined,
      logoUrl: original.logoUrl,
      items: {
        create: original.items.map((item) => ({
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

  if (!sheetId) {
    throw new Error("Missing sheetId");
  }

  if (!newTitle) {
    throw new Error("Missing new title");
  }

  const sheet = await prisma.labelSheet.findFirst({
    where: {
      id: sheetId,
      user: {
        email: session.user.email,
      },
    },
    select: {
      id: true,
    },
  });

  if (!sheet) {
    throw new Error("Sheet not found");
  }

  await prisma.labelSheet.update({
    where: {
      id: sheet.id,
    },
    data: {
      title: newTitle,
    },
  });

  revalidatePath("/app");
}

export async function deleteSheet(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const sheetId = String(formData.get("sheetId") || "");

  if (!sheetId) {
    throw new Error("Missing sheetId");
  }

  const sheet = await prisma.labelSheet.findFirst({
    where: {
      id: sheetId,
      user: {
        email: session.user.email,
      },
    },
    select: {
      id: true,
    },
  });

  if (!sheet) {
    throw new Error("Sheet not found");
  }

  await prisma.$transaction([
    prisma.labelItem.deleteMany({
      where: {
        sheetId: sheet.id,
      },
    }),
    prisma.labelSheet.delete({
      where: {
        id: sheet.id,
      },
    }),
  ]);

  revalidatePath("/app");
}