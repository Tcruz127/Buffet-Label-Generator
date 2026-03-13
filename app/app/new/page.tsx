export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function NewSheetPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect("/login");
  }

  const sheet = await prisma.labelSheet.create({
    data: {
      userId: user.id,
      title: "Untitled Sheet",
      totalLabels: 10,
      items: {
        create: Array.from({ length: 10 }, (_, i) => ({
          positionIndex: i,
          foodName: "",
          diets: [],
        })),
      },
    },
    select: { id: true },
  });

  redirect(`/app/sheet/${sheet.id}/editor`);
}