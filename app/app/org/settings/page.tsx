export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import OrgSettingsClient from "./OrgSettingsClient";

export default async function OrgSettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: {
        include: {
          organization: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      },
    },
  });

  const ownerMembership = user?.memberships.find((m) => m.role === "owner");

  if (!ownerMembership) {
    redirect("/app");
  }

  const org = ownerMembership.organization;

  return (
    <OrgSettingsClient
      orgId={org.id}
      orgName={org.name}
      currentUserId={user!.id}
      members={org.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      }))}
    />
  );
}
