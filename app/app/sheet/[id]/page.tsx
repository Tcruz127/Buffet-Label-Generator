export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SheetPage({ params }: PageProps) {
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

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              {sheet.title || "Untitled Sheet"}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              {sheet.eventName || "No event name"}
            </p>
          </div>

          <Link
            href={`/app/sheet/${sheet.id}/editor`}
            className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Open Editor
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-sm text-neutral-600">
            <p>Total labels: {sheet.totalLabels}</p>
            <p>
              Updated:{" "}
              {new Date(sheet.updatedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-3">
            {sheet.items.map((item: any) => (
              <div
                key={item.id}
                className="rounded-lg border border-neutral-200 p-4"
              >
                <p className="font-medium text-neutral-900">
                  {item.foodName || `Label ${item.positionIndex + 1}`}
                </p>
                <p className="text-sm text-neutral-500">
                  Position: {item.positionIndex + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}