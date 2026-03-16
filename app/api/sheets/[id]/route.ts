export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  FREE_PLAN_MAX_LABELS,
  isProUser,
} from "@/lib/plan";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type IncomingLabel = {
  id?: string;
  positionIndex?: number;
  food?: string;
  title?: string;
  name?: string;
  foodName?: string;
  diets?: unknown;
};

function normalizeDiets(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeFoodName(label: IncomingLabel): string {
  if (typeof label.foodName === "string") return label.foodName;
  if (typeof label.food === "string") return label.food;
  if (typeof label.title === "string") return label.title;
  if (typeof label.name === "string") return label.name;
  return "";
}

export async function GET(_req: Request, context: RouteContext) {
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

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPro = isProUser(user.subscriptionStatus);

    const existingSheet = await prisma.labelSheet.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        items: {
          orderBy: {
            positionIndex: "asc",
          },
        },
      },
    });

    if (!existingSheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    const rawLabels = Array.isArray(body.labelItems)
      ? body.labelItems
      : Array.isArray(body.labels)
      ? body.labels
      : null;

    const hasLabels = Array.isArray(rawLabels);

    const normalizedLabels = hasLabels
      ? rawLabels.map((label: IncomingLabel, index: number) => ({
          sheetId: id,
          positionIndex:
            typeof label.positionIndex === "number"
              ? label.positionIndex
              : index,
          foodName: normalizeFoodName(label),
          diets: normalizeDiets(label.diets),
        }))
      : [];

    if (!isPro && hasLabels && normalizedLabels.length > FREE_PLAN_MAX_LABELS) {
      return NextResponse.json(
        {
          error: `Free plan supports up to ${FREE_PLAN_MAX_LABELS} labels per sheet.`,
        },
        { status: 403 }
      );
    }

    const attemptedLogoChange =
      body.logoUrl !== undefined ||
      body.logoData !== undefined ||
      existingSheet.logoUrl !== null;

    if (!isPro && attemptedLogoChange) {
      const incomingLogoValue =
        typeof body.logoUrl === "string"
          ? body.logoUrl
          : typeof body.logoData === "string"
          ? body.logoData
          : null;

      if (incomingLogoValue !== null || existingSheet.logoUrl !== null) {
        return NextResponse.json(
          {
            error: "Logo upload is available on the Pro plan.",
          },
          { status: 403 }
        );
      }
    }

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
          : body.eventName === null
          ? {
              eventName: null,
            }
          : {}),

        ...(body.settings !== undefined
          ? {
              settings: body.settings,
            }
          : {}),

        ...((body.logoUrl !== undefined || body.logoData !== undefined) && isPro
          ? {
              logoUrl:
                typeof body.logoUrl === "string"
                  ? body.logoUrl
                  : typeof body.logoData === "string"
                  ? body.logoData
                  : null,
            }
          : {}),

        ...(hasLabels
          ? {
              totalLabels: normalizedLabels.length,
            }
          : {}),
      },
    });

    if (hasLabels) {
      await prisma.$transaction([
        prisma.labelItem.deleteMany({
          where: { sheetId: id },
        }),
        ...(normalizedLabels.length > 0
          ? [
              prisma.labelItem.createMany({
                data: normalizedLabels,
              }),
            ]
          : []),
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
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sheet = await prisma.labelSheet.findFirst({
      where: {
        id,
        userId: user.id,
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