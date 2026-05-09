export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function resolveUser(email: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  });
}

async function getOrgId(db: any, userId: string): Promise<string | null> {
  const membership = await db.organizationMember.findFirst({
    where: { userId },
    select: { organizationId: true },
  });
  return membership?.organizationId ?? null;
}

async function sheetAccessible(db: any, sheetId: string, userId: string, orgId: string | null) {
  return db.labelSheet.findFirst({
    where: {
      id: sheetId,
      OR: [
        { userId },
        ...(orgId ? [{ organizationId: orgId }] : []),
      ],
    },
    select: { id: true },
  });
}

export async function GET(_req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/prisma");
  const db = prisma as any;
  const { id } = await context.params;

  const user = await resolveUser(session.user.email);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(db, user.id);
  const sheet = await sheetAccessible(db, id, user.id, orgId);
  if (!sheet) return NextResponse.json({ error: "Sheet not found" }, { status: 404 });

  const comments = await db.sheetComment.findMany({
    where: { sheetId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      userId: true,
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/prisma");
  const db = prisma as any;
  const { id } = await context.params;

  const user = await resolveUser(session.user.email);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(db, user.id);
  const sheet = await sheetAccessible(db, id, user.id, orgId);
  if (!sheet) return NextResponse.json({ error: "Sheet not found" }, { status: 404 });

  const body = await req.json();
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }
  if (text.length > 1000) {
    return NextResponse.json({ error: "Comment is too long (max 1000 characters)" }, { status: 400 });
  }

  const comment = await db.sheetComment.create({
    data: { sheetId: id, userId: user.id, body: text },
    select: {
      id: true,
      body: true,
      createdAt: true,
      userId: true,
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
