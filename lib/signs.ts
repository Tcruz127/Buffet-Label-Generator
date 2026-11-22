import { prisma } from "@/lib/prisma";
import { getMenuWorkspace, workspaceWhere, type MenuWorkspace } from "@/lib/menus";

export * from "@/lib/signContent";

/**
 * Directional signage is a per-client feature: only organizations with
 * `signageEnabled` (set by hand, currently Crystal Springs) can use it.
 * Returns the workspace when allowed, otherwise null.
 */
export async function getSignageWorkspace(): Promise<MenuWorkspace | null> {
  const ws = await getMenuWorkspace();
  if (!ws?.organizationId) return null;

  const org = await prisma.organization.findUnique({
    where: { id: ws.organizationId },
    select: { signageEnabled: true },
  });
  return org?.signageEnabled ? ws : null;
}

/** Whether the signed-in user's organization has signage switched on (for showing the dashboard entry). */
export async function hasSignage(organizationId: string | null | undefined) {
  if (!organizationId) return false;
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { signageEnabled: true },
  });
  return org?.signageEnabled ?? false;
}

/** The organization's function rooms for the room picker, alphabetical. */
export async function getSignRooms(organizationId: string): Promise<string[]> {
  const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { signRooms: true } });
  return org?.signRooms ?? [];
}

export { workspaceWhere };
