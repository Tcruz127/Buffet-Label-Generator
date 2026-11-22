export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getSignRooms,
  getSignageWorkspace,
  parseSignDesign,
  parseSignLines,
  parseSigns,
  workspaceWhere,
} from "@/lib/signs";
import SignBuilder from "./SignBuilder";

export default async function SignBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const ws = await getSignageWorkspace();
  if (!ws) redirect("/app");

  const { id } = await params;
  const signSet = await prisma.signSet.findFirst({ where: { id, ...workspaceWhere(ws) } });
  if (!signSet) notFound();
  const rooms = await getSignRooms(ws.organizationId!);

  return (
    <SignBuilder
      signSet={{
        id: signSet.id,
        lines: parseSignLines(signSet.lines),
        room: signSet.room,
        signs: parseSigns(signSet.signs),
        design: parseSignDesign(signSet.design),
        venueLogo: signSet.venueLogo,
        groupLogo: signSet.groupLogo,
      }}
      rooms={rooms}
    />
  );
}
