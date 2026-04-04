export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await context.params;
  const { prisma } = await import("@/lib/prisma");

  const caller = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: true,
    },
  });

  if (!caller) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ownerMembership = caller.memberships.find((m) => m.role === "owner");

  if (!ownerMembership) {
    return NextResponse.json(
      { error: "Only the organization owner can remove members" },
      { status: 403 }
    );
  }

  if (caller.id === userId) {
    return NextResponse.json(
      { error: "You cannot remove yourself from the organization" },
      { status: 400 }
    );
  }

  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId: ownerMembership.organizationId,
      userId,
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Member not found in your organization" },
      { status: 404 }
    );
  }

  await prisma.organizationMember.delete({
    where: { id: membership.id },
  });

  return NextResponse.json({ success: true });
}
