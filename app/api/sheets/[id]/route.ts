export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

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
      include: {
        items: {
          orderBy: {
            positionIndex: "asc",
          },
        },
      },
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

export async function PUT(req: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/prisma");
  const { id } = await context.params;

  try {
    const body = await req.json();

    const sheet = await prisma.labelSheet.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
      include: {
        items: {
          orderBy: {
            positionIndex: "asc",
          },
        },
      },
    });

    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    const hasLabels = Array.isArray(body.labels);

    await prisma.labelSheet.update({
      where: { id },
      data: {
        ...(typeof body.title === "string"
          ? {
              title: body.title.trim() || "Untitled Sheet",
            }
          : {}),
        ...(typeof body.eventName === "string"
          ? {
              eventName: body.eventName,
            }
          : {}),
        ...(body.settings !== undefined
          ? {
              settings: body.settings,
            }
          : {}),
        ...(body.logoData !== undefined
          ? {
              logoUrl: typeof body.logoData === "string" ? body.logoData : null,
            }
          : {}),
        ...(hasLabels
          ? {
              totalLabels: body.labels.length,
            }
          : {}),
      },
    });

    if (hasLabels) {
      await prisma.$transaction([
        prisma.labelItem.deleteMany({
          where: { sheetId: id },
        }),
        prisma.labelItem.createMany({
          data: body.labels.map(
            (
              label: {
                food?: string;
                title?: string;
                name?: string;
                foodName?: string;
                diets?: string[];
              },
              index: number
            ) => ({
              sheetId: id,
              positionIndex: index,
              foodName:
                typeof label.food === "string"
                  ? label.food
                  : typeof label.title === "string"
                  ? label.title
                  : typeof label.name === "string"
                  ? label.name
                  : typeof label.foodName === "string"
                  ? label.foodName
                  : "",
              diets: Array.isArray(label.diets) ? label.diets : [],
            })
          ),
        }),
      ]);
    }

    const updated = await prisma.labelSheet.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            positionIndex: "asc",
          },
        },
      },
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

export async function PATCH(req: Request, context: RouteContext) {
  return PUT(req, context);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/prisma");
  const { id } = await context.params;

  try {
    const sheet = await prisma.labelSheet.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
      select: {
        id: true,
      },
    });

    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.labelItem.deleteMany({
        where: {
          sheetId: id,
        },
      }),
      prisma.labelSheet.delete({
        where: {
          id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE sheet error:", error);
    return NextResponse.json(
      { error: "Failed to delete sheet" },
      { status: 500 }
    );
  }
}