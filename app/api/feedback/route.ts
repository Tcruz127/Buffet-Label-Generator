export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendFeedbackNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? body.rating
      : null;

  if (!message || message.length > 2000) {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  const feedback = await (prisma as any).feedback.create({
    data: { userId: user.id, rating, body: message },
  });

  // Fire-and-forget — don't block the response on email delivery
  sendFeedbackNotificationEmail(session.user.email, rating, message).catch(
    () => {}
  );

  return NextResponse.json({ id: feedback.id });
}