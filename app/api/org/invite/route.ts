export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/prisma");
  const db = prisma as any;

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: {
        include: { organization: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ownerMembership = user.memberships.find((m: any) => m.role === "owner");

  if (!ownerMembership) {
    return NextResponse.json(
      { error: "Only organization owners can send invites" },
      { status: 403 }
    );
  }

  const org = ownerMembership.organization;

  // Check the invitee isn't already a member.
  const existingMember = await db.organizationMember.findFirst({
    where: {
      organizationId: org.id,
      user: { email },
    },
  });

  if (existingMember) {
    return NextResponse.json(
      { error: "That person is already a member of your organization" },
      { status: 400 }
    );
  }

  // Delete any existing pending invite for this email in this org.
  await db.organizationInvite.deleteMany({
    where: { organizationId: org.id, email },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await db.organizationInvite.create({
    data: {
      organizationId: org.id,
      email,
      expiresAt,
    },
  });

  const { sendOrgInviteEmail } = await import("@/lib/email");
  await sendOrgInviteEmail(
    email,
    invite.token,
    org.name,
    user.name ?? user.email
  );

  return NextResponse.json({ message: `Invite sent to ${email}` });
}
