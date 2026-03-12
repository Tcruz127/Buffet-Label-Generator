import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditorFrame from "./EditorFrame";

type PageProps = {
  params: Promise<{ id: string }>;
};

type SavedSettings = {
  font?: string;
  fontSize?: string | number;
  textColor?: string;
  allergenFont?: string;
  allergenSize?: string | number;
  allergenColor?: string;
  bgColor?: string;
  logoSettings?: {
    x?: number;
    y?: number;
    size?: number;
  };
  viewMode?: string;
};

export default async function SheetEditorPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id } = await params;

  const sheet = await prisma.labelSheet.findFirst({
    where: {
      id,
      user: {
        email: session.user.email,
      },
    },
    include: {
      items: true,
    },
  });

  if (!sheet) {
    notFound();
  }

  const sortedItems = [...sheet.items].sort(
    (a, b) => a.positionIndex - b.positionIndex
  );

  const settings =
    sheet.settings && typeof sheet.settings === "object"
      ? (sheet.settings as SavedSettings)
      : {};

  const sheetData = {
    id: sheet.id,
    name: sheet.title ?? "",
    eventName: sheet.eventName ?? "",
    totalLabels: sheet.totalLabels ?? 10,
    settings: {
      font: settings.font ?? "Arial",
      fontSize: settings.fontSize ?? 20,
      textColor: settings.textColor ?? "#000000",
      allergenFont: settings.allergenFont ?? "Arial",
      allergenSize: settings.allergenSize ?? 12,
      allergenColor: settings.allergenColor ?? "#000000",
      bgColor: settings.bgColor ?? "#ffffff",
      logoSettings: {
        x: settings.logoSettings?.x ?? 8,
        y: settings.logoSettings?.y ?? 8,
        size: settings.logoSettings?.size ?? 55,
      },
      viewMode: settings.viewMode ?? "side",
    },
    logoData: sheet.logoUrl ?? null,
    labels: sortedItems.map((item) => ({
      id: item.id,
      title: item.foodName ?? "",
      description: "",
      diets: Array.isArray(item.diets)
        ? item.diets.filter((diet: any) => typeof diet === "string")
        : [],
    })),
  };

  return (
    <main className="relative h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020617_0%,#0f172a_45%,#111827_100%)]" />
      </div>

      <div className="h-full p-2 md:p-3">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-2 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
          <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/75 p-2 h-full min-h-0">
            <EditorFrame sheet={sheetData} />
          </div>
        </div>
      </div>
    </main>
  );
}