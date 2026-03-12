import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SheetPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const sheet = await prisma.labelSheet.findFirst({
    where: {
      id,
      userId: (session.user as { id: string }).id,
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

  return (
    <main className="p-8">
      <div className="mb-6">
        <a href="/app" className="text-blue-600 underline">
          ← Back to Dashboard
        </a>
      </div>

      <h1 className="mb-2 text-3xl font-bold">{sheet.title}</h1>
      <p className="mb-6 text-gray-600">
        {sheet.eventName || "No event name yet"}
      </p>

      <div className="rounded border p-6">
        <p className="mb-4 font-semibold">Sheet ID</p>
        <p className="mb-6 text-sm text-gray-600">{sheet.id}</p>

        <p className="mb-4 font-semibold">Labels</p>

        <div className="space-y-2">
          {sheet.items.map((item) => (
            <div key={item.id} className="rounded border p-3">
              <p className="font-medium">Label {item.positionIndex}</p>
              <p className="text-sm text-gray-600">
                {item.foodName || "Empty"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}