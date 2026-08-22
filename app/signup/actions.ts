"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { track } from "@vercel/analytics/server";
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
    const issues = parsed.error.issues.map((i) => i.message).join(", ");
    const msg = encodeURIComponent(issues || "Invalid input.");
    redirect(`/signup?error=${msg}`);
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
    redirect("/signup?error=An+account+with+that+email+already+exists.");
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

  try {
    await track("Sign Up", undefined, { headers: await headers() });
  } catch {
    // Analytics failure should not block account creation
  }

  const conversionRedirectTo =
    redirectTo + (redirectTo.includes("?") ? "&" : "?") + "new_signup=1";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: conversionRedirectTo,
    });
  } catch {
    redirect("/login?success=1");
  }
}