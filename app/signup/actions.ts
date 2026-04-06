"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { hashPassword } from "../../lib/password";
import { signUpSchema } from "../../lib/validations/auth";
import { sendVerificationEmail } from "../../lib/email";

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/signup");
  }

  const name =
    typeof parsed.data.name === "string" ? parsed.data.name.trim() : "";

  const email =
    typeof parsed.data.email === "string"
      ? parsed.data.email.trim().toLowerCase()
      : "";

  const password = parsed.data.password;

  const raw = formData.get("callbackUrl");
  const redirectTo =
    typeof raw === "string" && raw.startsWith("/") ? raw : "/app";

  const { prisma } = await import("../../lib/prisma");

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    redirect("/signup");
  }

  const passwordHash = await hashPassword(password);

  const db = prisma as any;

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      passwordHash,
    },
    select: { id: true },
  });

  // Create a verification token and send the email (non-blocking — don't fail signup if email fails)
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const record = await db.emailVerifyToken.create({
      data: { userId: user.id, expiresAt },
      select: { token: true },
    });
    await sendVerificationEmail(email, record.token);
  } catch {
    // Email failure should not block account creation
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo,
  });
}