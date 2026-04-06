"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const db = prisma as any;

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) redirect("/forgot-password");

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  // Always redirect to the same page — don't reveal whether email exists
  if (user) {
    // Delete any existing tokens for this user
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const record = await db.passwordResetToken.create({
      data: { userId: user.id, expiresAt },
      select: { token: true },
    });

    await sendPasswordResetEmail(email, record.token);
  }

  redirect("/forgot-password?sent=1");
}
