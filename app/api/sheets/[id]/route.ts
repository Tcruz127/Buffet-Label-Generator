export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { prisma } = await import("@/lib/prisma");
  const { id } = await context.params;

  try {
    const sheet = await prisma.labelSheet.findUnique({
      where: { id },
    });

    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    return NextResponse.json(sheet);
  } catch (error) {
    console.error("GET sheet error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheet" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { prisma } = await import("@/lib/prisma");
  const { id } = await context.params;

  try {
    await prisma.labelItem.deleteMany({
      where: { sheetId: id },
    });

    await prisma.labelSheet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE sheet error:", error);
    return NextResponse.json(
      { error: "Failed to delete sheet" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const { prisma } = await import("@/lib/prisma");
  const { id } = await context.params;

  try {
    const data = await req.json();

    const updated = await prisma.labelSheet.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH sheet error:", error);
    return NextResponse.json(
      { error: "Failed to update sheet" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const { prisma } = await import("@/lib/prisma");
  const { id } = await context.params;

  try {
    const data = await req.json();

    const updated = await prisma.labelSheet.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT sheet error:", error);
    return NextResponse.json(
      { error: "Failed to update sheet" },
      { status: 500 }
    );
  }
}
