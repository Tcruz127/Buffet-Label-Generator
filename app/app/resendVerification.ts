"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

const db = prisma as any;

export async function resendVerificationEmail() {
  const session = await auth();
  if (!session?.user?.email) return;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, emailVerified: true },
  });

  if (!user || user.emailVerified) return;

  // Delete any existing tokens
  await db.emailVerifyToken.deleteMany({ where: { userId: user.id } });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const record = await db.emailVerifyToken.create({
    data: { userId: user.id, expiresAt },
    select: { token: true },
  });

  await sendVerificationEmail(user.email, record.token);
  revalidatePath("/app");
}
