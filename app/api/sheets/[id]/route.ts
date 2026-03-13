export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { prisma } = await import("@/lib/prisma");

  try {
    const sheet = await prisma.labelSheet.findUnique({
      where: { id: params.id },
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { prisma } = await import("@/lib/prisma");

  try {
    await prisma.labelSheet.delete({
      where: { id: params.id },
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { prisma } = await import("@/lib/prisma");

  try {
    const data = await req.json();

    const updated = await prisma.labelSheet.update({
      where: { id: params.id },
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