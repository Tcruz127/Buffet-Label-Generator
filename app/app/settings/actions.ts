"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const { prisma } = await import("@/lib/prisma");
  const user = await (prisma as any).user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, passwordHash: true },
  });
  if (!user) redirect("/login");
  return { prisma, user };
}

export async function updateName(formData: FormData) {
  const { prisma, user } = await getAuthenticatedUser();
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name || name.length < 1) {
    redirect("/app/settings?error=name:Name+cannot+be+empty.");
  }
  await (prisma as any).user.update({ where: { id: user.id }, data: { name } });
  redirect("/app/settings?updated=name");
}

export async function updateEmail(formData: FormData) {
  const { prisma, user } = await getAuthenticatedUser();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/app/settings?error=email:Please+enter+a+valid+email+address.");
  }
  if (email === user.email) {
    redirect("/app/settings?error=email:That+is+already+your+current+email.");
  }
  const existing = await (prisma as any).user.findUnique({ where: { email } });
  if (existing) {
    redirect("/app/settings?error=email:An+account+with+that+email+already+exists.");
  }
  await (prisma as any).user.update({
    where: { id: user.id },
    data: { email, emailVerified: false },
  });
  redirect("/app/settings?updated=email");
}

export async function updatePassword(formData: FormData) {
  const { prisma, user } = await getAuthenticatedUser();
  const current = (formData.get("currentPassword") as string | null) ?? "";
  const next = (formData.get("newPassword") as string | null) ?? "";
  const confirm = (formData.get("confirmPassword") as string | null) ?? "";

  const valid = await verifyPassword(current, user.passwordHash);
  if (!valid) {
    redirect("/app/settings?error=password:Current+password+is+incorrect.");
  }
  if (next.length < 8) {
    redirect("/app/settings?error=password:New+password+must+be+at+least+8+characters.");
  }
  if (next !== confirm) {
    redirect("/app/settings?error=password:Passwords+do+not+match.");
  }
  const passwordHash = await hashPassword(next);
  await (prisma as any).user.update({ where: { id: user.id }, data: { passwordHash } });
  redirect("/app/settings?updated=password");
}