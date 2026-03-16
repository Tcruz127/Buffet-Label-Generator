export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LABEL_TEMPLATES } from "@/lib/templates";

async function createSheet(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect("/login");
  }

  const templateId = formData.get("templateId") as string;

  const template =
    LABEL_TEMPLATES.find((t) => t.id === templateId) ?? LABEL_TEMPLATES[0];

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

  const settings = {
    ...defaultSettings,
    ...(template.settings ?? {}),
  };

  const sheet = await prisma.labelSheet.create({
    data: {
      userId: user.id,
      title: "Untitled Sheet",
      eventName: "",
      totalLabels: 10,
      settings,
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

export default async function NewSheetPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Choose a Template</h1>

      <p className="text-gray-600 mb-8">
        Start with a professional design for your buffet labels.
      </p>

      <form action={createSheet}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {LABEL_TEMPLATES.map((template) => (
            <button
              key={template.id}
              name="templateId"
              value={template.id}
              type="submit"
              className="group border rounded-xl overflow-hidden bg-white hover:shadow-lg transition text-left"
            >
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                {template.preview ? (
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">
                    Template Preview
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{template.name}</h3>

                  {template.proOnly && (
                    <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
                      Pro
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600">
                  {template.description}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {template.category}
                </p>
              </div>
            </button>
          ))}

        </div>
      </form>
    </div>
  );
}