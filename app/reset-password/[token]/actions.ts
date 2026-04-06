"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const db = prisma as any;

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const errorBase = `/reset-password/${token}`;

  if (password.length < 8) redirect(`${errorBase}?error=short`);
  if (password !== confirmPassword) redirect(`${errorBase}?error=mismatch`);

  const record = await db.passwordResetToken.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  });

  if (!record || new Date(record.expiresAt) < new Date()) {
    redirect(`${errorBase}?error=expired`);
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  // Delete the used token
  await db.passwordResetToken.delete({ where: { token } });

  redirect(`${errorBase}?success=1`);
}
