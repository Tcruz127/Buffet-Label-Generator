import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const sheet = await prisma.labelSheet.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
      include: {
        items: true,
      },
    });

    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    const title =
      typeof body.title === "string" && body.title.trim() !== ""
        ? body.title.trim()
        : sheet.title;

    const eventName =
      typeof body.eventName === "string" ? body.eventName : "";

    const labels = Array.isArray(body.labels) ? body.labels : [];

    const settings =
      body.settings && typeof body.settings === "object"
        ? body.settings
        : null;

    const logoUrl =
      typeof body.logoData === "string" && body.logoData.trim() !== ""
        ? body.logoData
        : null;

    await prisma.labelSheet.update({
      where: {
        id: sheet.id,
      },
      data: {
        title,
        eventName,
        totalLabels: Math.max(labels.length, 10),
        settings,
        logoUrl,
      },
    });

    for (let index = 0; index < labels.length; index++) {
      const label = labels[index];

      const foodName =
        typeof label?.food === "string" ? label.food : "";

      const diets = Array.isArray(label?.diets)
        ? label.diets.filter((d: unknown): d is string => typeof d === "string")
        : [];

      await prisma.labelItem.upsert({
        where: {
          sheetId_positionIndex: {
            sheetId: sheet.id,
            positionIndex: index + 1,
          },
        },
        update: {
          foodName,
          diets,
        },
        create: {
          sheetId: sheet.id,
          positionIndex: index + 1,
          foodName,
          diets,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/sheets/[id] failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}