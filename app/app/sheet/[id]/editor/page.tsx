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

  const db = prisma as any;

  // Find the user and their org membership so we can allow access to org sheets.
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      subscriptionStatus: true,
      memberships: {
        select: {
          role: true,
          organization: {
            select: {
              members: {
                select: {
                  role: true,
                  user: { select: { subscriptionStatus: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!currentUser) {
    redirect("/login");
  }

  const { isOrgProUser } = await import("@/lib/plan");
  const isPro = isOrgProUser(currentUser.subscriptionStatus, currentUser.memberships);

  const membership = currentUser.memberships[0] ?? null;

  const sheet = await db.labelSheet.findFirst({
    where: {
      id,
      OR: [
        { userId: currentUser.id },
        ...(membership ? [{ organizationId: membership.organizationId }] : []),
      ],
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

  return <EditorFrame sheet={safeSheet} isPro={isPro} />;
}