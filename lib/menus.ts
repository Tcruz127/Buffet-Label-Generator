import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isOrgProUser } from "@/lib/plan";
import type { Library } from "@/lib/menuContent";

export * from "@/lib/menuContent";

// Generic starter library for a workspace's first visit; customers replace it with their own.
const DEFAULT_LIBRARY: { name: string; dishes: { name: string; description: string }[] }[] = [
  {
    name: "STARTERS",
    dishes: [
      { name: "Classic Caesar Salad", description: "romaine hearts, shaved parmesan, garlic croutons" },
      { name: "Roasted Tomato Soup", description: "basil oil, toasted crostini" },
    ],
  },
  {
    name: "ENTREES",
    dishes: [
      { name: "Herb Roasted Chicken", description: "whipped potatoes, seasonal vegetables, pan jus" },
      { name: "Grilled Salmon", description: "wild rice pilaf, asparagus, lemon butter" },
    ],
  },
  {
    name: "DESSERT",
    dishes: [{ name: "Chocolate Mousse", description: "whipped cream, fresh berries" }],
  },
];

export type MenuWorkspace = {
  userId: string;
  organizationId: string | null;
  isPro: boolean;
};

/** Resolves the signed-in user's workspace (org if they have one) and Pro status. */
export async function getMenuWorkspace(): Promise<MenuWorkspace | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      subscriptionStatus: true,
      memberships: {
        select: {
          role: true,
          organizationId: true,
          organization: {
            select: {
              members: {
                select: { role: true, user: { select: { subscriptionStatus: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!user) return null;

  return {
    userId: user.id,
    organizationId: user.memberships[0]?.organizationId ?? null,
    isPro: isOrgProUser(user.subscriptionStatus, user.memberships),
  };
}

/** Prisma `where` clause for records owned by this workspace. */
export function workspaceWhere(ws: MenuWorkspace) {
  return ws.organizationId
    ? { organizationId: ws.organizationId }
    : { userId: ws.userId, organizationId: null };
}

/** Loads the workspace's dish library, seeding the starter package the first time. */
export async function getLibrary(ws: MenuWorkspace): Promise<Library> {
  const load = async (): Promise<Library> => {
    const [packages, sections] = await Promise.all([
      prisma.menuPackage.findMany({
        where: workspaceWhere(ws),
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true, sortOrder: true },
      }),
      prisma.menuSection.findMany({
        where: workspaceWhere(ws),
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          packageId: true,
          name: true,
          sortOrder: true,
          dishes: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: { id: true, name: true, description: true, sortOrder: true },
          },
        },
      }),
    ]);
    return { packages, sections };
  };

  const library = await load();
  if (library.packages.length > 0 || library.sections.length > 0) return library;

  const hasMenus = await prisma.platedMenu.count({ where: workspaceWhere(ws) });
  if (hasMenus > 0) return library; // user cleared the library on purpose

  await prisma.menuPackage.create({
    data: {
      userId: ws.userId,
      organizationId: ws.organizationId,
      name: "Plated Dinner",
      sections: {
        create: DEFAULT_LIBRARY.map((section, i) => ({
          userId: ws.userId,
          organizationId: ws.organizationId,
          name: section.name,
          sortOrder: i,
          dishes: {
            create: section.dishes.map((dish, j) => ({ ...dish, sortOrder: j })),
          },
        })),
      },
    },
  });
  return load();
}

