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

  const defaultSettings = {
    viewMode: "grid",
    paperSize: "avery-5305",
    showBorders: true,
    logoEnabled: false,
    logoPosition: "top",
    logoAlign: "center",
    fontFamily: "Arial",
    fontSize: 18,
    titleFontSize: 18,
    subtitleFontSize: 12,
    textColor: "#111111",
    accentColor: "#111111",
    backgroundColor: "#ffffff",
    borderColor: "#d4d4d8",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    cardGap: 12,
  };

  const sheet = await prisma.labelSheet.create({
    data: {
      userId: user.id,
      title: "Untitled Sheet",
      eventName: "",
      totalLabels: 10,
      settings: defaultSettings,
      logoUrl: null,
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