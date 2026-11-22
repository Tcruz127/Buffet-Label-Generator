"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SIGN_DESIGN,
  getSignageWorkspace,
  newSignId,
  parseSignDesign,
  parseSignLines,
  parseSigns,
  sortRooms,
  workspaceWhere,
  type SignDesign,
  type SignEntry,
} from "@/lib/signs";
import type { MenuWorkspace } from "@/lib/menus";

async function requireSignageWorkspace(): Promise<MenuWorkspace> {
  const ws = await getSignageWorkspace();
  if (!ws) throw new Error("Signage isn't enabled for this account.");
  return ws;
}

async function requireSignSet(ws: MenuWorkspace, signSetId: string) {
  const signSet = await prisma.signSet.findFirst({ where: { id: signSetId, ...workspaceWhere(ws) } });
  if (!signSet) throw new Error("Sign set not found.");
  return signSet;
}

export async function createSignSet() {
  const ws = await requireSignageWorkspace();

  // Reuse the venue logo from the most recent set so it isn't uploaded every time.
  const latest = await prisma.signSet.findFirst({
    where: { ...workspaceWhere(ws), venueLogo: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { venueLogo: true },
  });

  const signSet = await prisma.signSet.create({
    data: {
      userId: ws.userId,
      organizationId: ws.organizationId,
      lines: ["Group Name"],
      room: "",
      signs: [{ id: newSignId(), arrow: "left", copies: 1 }],
      design: DEFAULT_SIGN_DESIGN,
      venueLogo: latest?.venueLogo ?? null,
    },
  });

  redirect(`/app/signs/${signSet.id}`);
}

export async function saveSignSet(
  signSetId: string,
  data: { lines: string[]; room: string; signs: SignEntry[]; design: SignDesign }
) {
  const ws = await requireSignageWorkspace();
  await requireSignSet(ws, signSetId);

  const lines = parseSignLines(data.lines);
  await prisma.signSet.update({
    where: { id: signSetId },
    data: {
      title: lines.find((l) => l.trim())?.trim().slice(0, 120) || "Untitled Signs",
      lines,
      room: typeof data.room === "string" ? data.room.trim().slice(0, 80) : "",
      signs: parseSigns(data.signs),
      design: parseSignDesign(data.design),
    },
  });
}

// Logos arrive already downscaled to PNG in the browser; this cap is a safety net.
const MAX_LOGO_DATA_URL_LENGTH = 3_000_000;

export async function setSignLogo(signSetId: string, slot: "venue" | "group", logoData: string | null) {
  const ws = await requireSignageWorkspace();
  await requireSignSet(ws, signSetId);

  if (logoData !== null) {
    if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(logoData)) {
      throw new Error("Logo must be a PNG, JPEG or WebP image.");
    }
    if (logoData.length > MAX_LOGO_DATA_URL_LENGTH) throw new Error("Logo image is too large.");
  }

  await prisma.signSet.update({
    where: { id: signSetId },
    data: slot === "venue" ? { venueLogo: logoData } : { groupLogo: logoData },
  });
}

export async function duplicateSignSet(signSetId: string) {
  const ws = await requireSignageWorkspace();
  const source = await requireSignSet(ws, signSetId);

  const copy = await prisma.signSet.create({
    data: {
      userId: ws.userId,
      organizationId: ws.organizationId,
      title: `${source.title} (copy)`,
      lines: parseSignLines(source.lines),
      room: source.room,
      signs: parseSigns(source.signs).map((s) => ({ ...s, id: newSignId() })),
      design: parseSignDesign(source.design),
      venueLogo: source.venueLogo,
      groupLogo: source.groupLogo,
    },
  });

  redirect(`/app/signs/${copy.id}`);
}

// ── Function room list (shared by the organization) ───────────────────

async function updateRooms(change: (rooms: string[]) => string[]) {
  const ws = await requireSignageWorkspace();
  const organizationId = ws.organizationId!;
  const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { signRooms: true } });
  const rooms = sortRooms(change(org?.signRooms ?? []));
  await prisma.organization.update({ where: { id: organizationId }, data: { signRooms: rooms } });
  return rooms;
}

/** Adds a room to the organization's list; returns the updated alphabetical list. */
export async function addSignRoom(name: string) {
  const room = typeof name === "string" ? name.trim().slice(0, 80) : "";
  if (!room) throw new Error("Room name is required.");
  return updateRooms((rooms) => [...rooms, room]);
}

/** Removes a room from the list (signs already using it keep their text). */
export async function removeSignRoom(name: string) {
  return updateRooms((rooms) => rooms.filter((r) => r !== name));
}

export async function deleteSignSet(signSetId: string) {
  const ws = await requireSignageWorkspace();
  await requireSignSet(ws, signSetId);
  await prisma.signSet.delete({ where: { id: signSetId } });
  revalidatePath("/app/signs");
}
