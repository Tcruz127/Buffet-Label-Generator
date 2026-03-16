export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATE, LABEL_TEMPLATES } from "@/lib/templates";
import {
  FREE_PLAN_MAX_SHEETS,
  isProUser,
} from "@/lib/plan";

async function createSheet(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isPro = isProUser(user.subscriptionStatus);

  const sheetCount = await prisma.labelSheet.count({
    where: {
      userId: user.id,
    },
  });

  if (!isPro && sheetCount >= FREE_PLAN_MAX_SHEETS) {
    redirect("/app?error=free-sheet-limit");
  }

  const templateId = String(formData.get("templateId") || "");
  const template =
    LABEL_TEMPLATES.find((t) => t.id === templateId) ?? DEFAULT_TEMPLATE;

  if (template.proOnly && !isPro) {
    redirect("/app/new?error=pro-template-required");
  }

  const defaultSettings = {
    themeName: "Classic White",

    backgroundColor: "#ffffff",
    textColor: "#111111",
    accentColor: "#444444",

    fontFamily: "Arial",
    foodNameSize: 20,
    dietTextSize: 12,

    align: "center",
    padding: 8,
    cardGap: 0,

    showBorder: true,
    borderColor: "#cfcfcf",
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: "classic",

    divider: "none",

    showLogo: true,
    logoPosition: "top",

    backgroundTexture: "",
    backgroundImage: "",

    logoSettings: {
      x: 8,
      y: 8,
      size: 55,
    },

    viewMode: "side",
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

export default async function NewSheetPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const error = resolvedSearchParams?.error;

  const isPro = isProUser(user.subscriptionStatus);

  const sheetCount = await prisma.labelSheet.count({
    where: {
      userId: user.id,
    },
  });

  const freeLimitReached = !isPro && sheetCount >= FREE_PLAN_MAX_SHEETS;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Choose a Template</h1>
          <p className="text-gray-600">
            Start with a professional design for your buffet labels.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:w-[320px]">
          <div className="text-sm text-gray-500">Current plan</div>
          <div className="mt-1 text-xl font-semibold">
            {isPro ? "Pro" : "Free"}
          </div>

          {!isPro && (
            <>
              <div className="mt-3 text-sm text-gray-600">
                Free plan includes up to {FREE_PLAN_MAX_SHEETS} sheets.
              </div>
              <div className="mt-3">
                <Link
                  href="/app"
                  className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {error === "pro-template-required" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          That template is available on the Pro plan.
        </div>
      )}

      {error === "free-sheet-limit" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have reached the free plan limit of {FREE_PLAN_MAX_SHEETS} sheets.
          Upgrade to Pro for unlimited sheets.
        </div>
      )}

      {freeLimitReached && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          You cannot create another sheet on the free plan until you upgrade or
          delete an existing sheet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {LABEL_TEMPLATES.map((template) => {
          const locked = template.proOnly && !isPro;
          const disabled = freeLimitReached || locked;

          return (
            <form key={template.id} action={createSheet}>
              <input type="hidden" name="templateId" value={template.id} />

              <button
                type="submit"
                disabled={disabled}
                className={`group w-full overflow-hidden rounded-xl border bg-white text-left transition ${
                  disabled
                    ? "cursor-not-allowed border-gray-200 opacity-80"
                    : "border-gray-200 hover:-translate-y-0.5 hover:shadow-lg"
                }`}
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {template.preview ? (
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                      Template Preview
                    </div>
                  )}

                  {template.proOnly && (
                    <div className="absolute right-3 top-3 rounded-full bg-black px-2 py-1 text-xs font-medium text-white">
                      Pro
                    </div>
                  )}

                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 px-4 text-center">
                      <div className="rounded-lg bg-white/95 px-4 py-3 text-sm font-medium text-gray-900 shadow">
                        Upgrade to use this template
                      </div>
                    </div>
                  )}

                  {freeLimitReached && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 px-4 text-center">
                      <div className="rounded-lg bg-white/95 px-4 py-3 text-sm font-medium text-gray-900 shadow">
                        Free plan sheet limit reached
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{template.name}</h3>
                    <span className="text-xs text-gray-400">
                      {template.category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    {template.description}
                  </p>
                </div>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}