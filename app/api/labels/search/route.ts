export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/prisma");
  const db = prisma as any;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id },
    select: { organizationId: true },
  });
  const orgId = membership?.organizationId ?? null;

  const sheetWhere = orgId
    ? { organizationId: orgId }
    : { userId: user.id };

  const results = await db.labelItem.findMany({
    where: {
      sheet: sheetWhere,
      OR: [
        { foodName: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
      // Only include labels that have actual content
      NOT: { foodName: null },
    },
    select: {
      id: true,
      foodName: true,
      description: true,
      diets: true,
      sheet: {
        select: { id: true, title: true },
      },
    },
    orderBy: { sheet: { updatedAt: "desc" } },
    take: 60,
  });

  // Filter out blank food names after the query
  const filtered = results.filter(
    (r: { foodName: string | null }) => r.foodName && r.foodName.trim()
  );

  return NextResponse.json(filtered);
}