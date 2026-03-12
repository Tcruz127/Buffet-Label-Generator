import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";

export default async function NewSheetPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const sheet = await prisma.labelSheet.create({
    data: {
      userId: (session.user as { id: string }).id,
      title: "Untitled Sheet",
      eventName: "",
      totalLabels: 10,
      settings: {},
      logoUrl: null,
      items: {
        create: Array.from({ length: 10 }, (_, index) => ({
          positionIndex: index + 1,
          foodName: "",
          diets: [],
        })),
      },
    },
  });

  redirect(`/app/sheet/${sheet.id}/editor`);
}