export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { token } = await context.params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

  const session = await auth();

  if (!session?.user?.email) {
    // Not logged in — send them to login, then back here after.
    return NextResponse.redirect(
      `${appUrl}/login?redirect=/api/org/invite/accept/${token}`
    );
  }

  const { prisma } = await import("@/lib/prisma");

  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) {
    return NextResponse.redirect(`${appUrl}/app?invite=invalid`);
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.redirect(`${appUrl}/app?invite=expired`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true },
  });

  if (!user) {
    return NextResponse.redirect(`${appUrl}/app?invite=invalid`);
  }

  if (user.memberships.length > 0) {
    return NextResponse.redirect(`${appUrl}/app?invite=already-member`);
  }

  // Add the user as a member and remove the invite.
  await prisma.$transaction([
    prisma.organizationMember.create({
      data: {
        organizationId: invite.organizationId,
        userId: user.id,
        role: "member",
      },
    }),
    prisma.organizationInvite.delete({
      where: { token },
    }),
  ]);

  return NextResponse.redirect(`${appUrl}/app?invite=accepted`);
}
