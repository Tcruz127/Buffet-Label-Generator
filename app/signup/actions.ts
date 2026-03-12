"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/password";
import { signUpSchema } from "../../lib/validations/auth";

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/signup");
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    redirect("/signup");
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name: name || null,
      email,
      passwordHash,
    },
  });

  redirect("/login");
}