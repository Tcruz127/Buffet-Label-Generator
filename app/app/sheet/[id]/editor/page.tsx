export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import EditorFrame from "./EditorFrame";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SheetEditorPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id } = await params;
  const { prisma } = await import("@/lib/prisma");

  const sheet = await prisma.labelSheet.findFirst({
    where: {
      id,
      user: {
        email: session.user.email,
      },
    },
    include: {
      items: {
        orderBy: {
          positionIndex: "asc",
        },
      },
    },
  });

  if (!sheet) {
    redirect("/app");
  }

  const safeSheet = {
    ...sheet,
    createdAt: sheet.createdAt.toISOString(),
    updatedAt: sheet.updatedAt.toISOString(),
    items: sheet.items.map((item: any) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  } as any;

  return <EditorFrame sheet={safeSheet} />;
}