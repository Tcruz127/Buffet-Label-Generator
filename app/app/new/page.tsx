export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATE, LABEL_TEMPLATES } from "@/lib/templates";
import { FREE_PLAN_MAX_SHEETS, isProUser } from "@/lib/plan";

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

function getPreviewBorderStyle(template: (typeof LABEL_TEMPLATES)[number]) {
  const settings = template.settings ?? {};
  const showBorder = settings.showBorder !== false;
  const borderColor = settings.borderColor ?? "#d1d5db";
  const borderWidth = settings.borderWidth ?? 1;
  const borderRadius = settings.borderRadius ?? 10;
  const borderStyle = settings.borderStyle ?? "classic";

  if (!showBorder) {
    return {
      border: "none",
      borderRadius: `${borderRadius}px`,
      boxShadow: "none",
    };
  }

  if (borderStyle === "double") {
    return {
      border: `${Math.max(borderWidth, 1)}px double ${borderColor}`,
      borderRadius: `${borderRadius}px`,
      boxShadow: "none",
    };
  }

  if (borderStyle === "gold-frame") {
    return {
      border: `${Math.max(borderWidth, 2)}px solid ${borderColor}`,
      borderRadius: `${borderRadius}px`,
      boxShadow: `inset 0 0 0 2px rgba(212,175,55,0.18)`,
    };
  }

  if (borderStyle === "elegant") {
    return {
      border: `${Math.max(borderWidth, 1)}px solid ${borderColor}`,
      borderRadius: `${borderRadius}px`,
      boxShadow: `0 0 0 1px rgba(0,0,0,0.03) inset`,
    };
  }

  if (borderStyle === "modern") {
    return {
      border: `${Math.max(borderWidth, 1)}px solid ${borderColor}`,
      borderRadius: `${borderRadius}px`,
      boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    };
  }

  return {
    border: `${Math.max(borderWidth, 1)}px solid ${borderColor}`,
    borderRadius: `${borderRadius}px`,
    boxShadow: "none",
  };
}

function getDividerStyles(template: (typeof LABEL_TEMPLATES)[number]) {
  const settings = template.settings ?? {};
  const divider = settings.divider ?? "none";
  const accentColor = settings.accentColor ?? "#64748b";

  if (divider === "none") {
    return null;
  }

  if (divider === "modern") {
    return {
      height: "2px",
      width: "58%",
      borderRadius: "999px",
      background: `linear-gradient(90deg, transparent 0%, ${accentColor} 20%, ${accentColor} 80%, transparent 100%)`,
      opacity: 0.9,
    };
  }

  if (divider === "elegant") {
    return {
      height: "1px",
      width: "62%",
      borderRadius: "999px",
      background: `linear-gradient(90deg, transparent 0%, ${accentColor} 22%, ${accentColor} 78%, transparent 100%)`,
      opacity: 0.75,
    };
  }

  return {
    height: "1px",
    width: "56%",
    borderRadius: "999px",
    background: accentColor,
    opacity: 0.7,
  };
}

function getPreviewBackground(template: (typeof LABEL_TEMPLATES)[number]) {
  const settings = template.settings ?? {};
  const backgroundColor = settings.backgroundColor ?? "#ffffff";
  const backgroundTexture = settings.backgroundTexture ?? "";
  const backgroundImage = settings.backgroundImage ?? "";

  const backgrounds = [backgroundColor];

  if (backgroundTexture) {
    backgrounds.unshift(`url(${backgroundTexture})`);
  }

  if (backgroundImage) {
    backgrounds.unshift(`url(${backgroundImage})`);
  }

  return backgrounds.join(", ");
}

function TemplatePreview({
  template,
}: {
  template: (typeof LABEL_TEMPLATES)[number];
}) {
  const settings = template.settings ?? {};
  const textColor = settings.textColor ?? "#111827";
  const accentColor = settings.accentColor ?? "#64748b";
  const align = settings.align ?? "center";
  const fontFamily = settings.fontFamily ?? "Arial";
  const foodNameSize = settings.foodNameSize ?? 28;
  const dietTextSize = settings.dietTextSize ?? 12;
  const padding = settings.padding ?? 8;
  const logoPosition = settings.logoPosition ?? "top";

  const borderStyles = getPreviewBorderStyle(template);
  const dividerStyles = getDividerStyles(template);

  const sampleTitle =
    template.name === "Elegant Wedding"
      ? "Herb Roasted Chicken"
      : template.name === "Corporate Buffet"
      ? "Braised Short Rib"
      : template.name === "Rustic Farmhouse"
      ? "Maple Glazed Carrots"
      : template.name === "Holiday Gold"
      ? "Cranberry Brie Bites"
      : template.name === "Minimal Modern"
      ? "Seared Salmon"
      : "Chicken Marsala";

  const sampleDiets =
    template.name === "Corporate Buffet"
      ? ["Gluten Free", "Dairy Free"]
      : template.name === "Holiday Gold"
      ? ["Nut Free", "Egg Free"]
      : ["Gluten Free", "Egg Free"];

  const dietIcons: Record<string, string> = {
    "Gluten Free": "🌾",
    "Dairy Free": "🥛",
    "Egg Free": "🥚",
    "Nut Free": "🥜",
    "Soy Free": "🫘",
  };

  const justifyMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  } as const;

  const textAlignMap = {
    left: "left",
    center: "center",
    right: "right",
  } as const;

  return (
    <div className="absolute inset-0 p-5">
      <div
        style={{
          width: "100%",
          height: "100%",
          background: getPreviewBackground(template),
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px",
          ...borderStyles,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            color: textColor,
            fontFamily,
            display: "flex",
            flexDirection: "column",
            alignItems: justifyMap[align],
            justifyContent: "center",
            textAlign: textAlignMap[align],
            gap: "10px",
            padding: `${padding}px`,
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: justifyMap[align],
            }}
          >
            {logoPosition !== "center" && (
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: accentColor,
                  fontWeight: 700,
                  opacity: 0.9,
                }}
              >
                {template.category}
              </div>
            )}
          </div>

          <div
            style={{
              fontSize: `${Math.max(16, Math.round(foodNameSize * 0.58))}px`,
              lineHeight: 1.08,
              fontWeight: 800,
              width: "100%",
              wordBreak: "break-word",
              letterSpacing:
                template.id === "minimal-modern" ? "-0.03em" : "-0.02em",
            }}
          >
            {sampleTitle}
          </div>

          {dividerStyles && (
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: justifyMap[align],
              }}
            >
              <div style={dividerStyles} />
            </div>
          )}

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: justifyMap[align],
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "center",
                justifyContent: justifyMap[align],
                fontSize: `${Math.max(10, Math.round(dietTextSize * 0.95))}px`,
                lineHeight: 1.25,
                color: textColor,
                opacity: 0.88,
              }}
            >
              {sampleDiets.map((diet, index) => (
                <span
                  key={diet}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{dietIcons[diet] ?? "•"}</span>
                  <span>{diet}</span>
                  {index < sampleDiets.length - 1 && <span>•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
      name: true,
      email: true,
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
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#f8fbff_0%,#f4f7fb_55%,#ffffff_100%)] px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 px-5 py-5 lg:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  Template Workspace
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Choose a Template
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Start with a professional design for your buffet labels, then
                  customize fonts, layout, logo placement, dietary tags, and
                  printing settings inside the editor.
                </p>
              </div>

              <div className="w-full xl:max-w-sm">
                <div className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.95))] p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Current plan
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                            isPro
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                          }`}
                        >
                          {isPro ? "Pro Plan" : "Free Plan"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right ring-1 ring-slate-200">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Sheets
                      </div>
                      <div className="mt-1 text-lg font-black text-slate-950">
                        {sheetCount}
                      </div>
                    </div>
                  </div>

                  {!isPro ? (
                    <div className="space-y-4">
                      <p className="text-sm leading-6 text-slate-600">
                        Free plan includes up to {FREE_PLAN_MAX_SHEETS} sheets.
                        Upgrade to unlock unlimited sheets and all premium
                        templates.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href="/app"
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
                        >
                          Upgrade to Pro
                        </Link>

                        <Link
                          href="/app"
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                        >
                          Back to Dashboard
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm leading-6 text-slate-600">
                        You have access to all templates, unlimited sheets, and
                        the full editing experience.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href="/app"
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                        >
                          Back to Dashboard
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error === "pro-template-required" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                That template is available on the Pro plan.
              </div>
            )}

            {error === "free-sheet-limit" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                You have reached the free plan limit of {FREE_PLAN_MAX_SHEETS}{" "}
                sheets. Upgrade to Pro for unlimited sheets.
              </div>
            )}

            {freeLimitReached && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                You cannot create another sheet on the free plan until you
                upgrade or delete an existing sheet.
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {LABEL_TEMPLATES.map((template) => {
                const locked = template.proOnly && !isPro;
                const disabled = freeLimitReached || locked;

                return (
                  <form key={template.id} action={createSheet}>
                    <input
                      type="hidden"
                      name="templateId"
                      value={template.id}
                    />

                    <button
                      type="submit"
                      disabled={disabled}
                      className={`group block w-full overflow-hidden rounded-[1.7rem] border bg-white text-left shadow-sm transition ${
                        disabled
                          ? "cursor-not-allowed border-slate-200 opacity-85"
                          : "border-slate-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
                      }`}
                    >
                      <div className="relative">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 opacity-80" />

                        <div className="relative aspect-[4/3] bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
                          <TemplatePreview template={template} />

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                          {template.proOnly && (
                            <div className="absolute right-4 top-4 rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white shadow">
                              Pro
                            </div>
                          )}

                          {locked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 px-5 text-center">
                              <div className="rounded-2xl bg-white/95 px-4 py-3 text-sm font-semibold text-slate-900 shadow-xl">
                                Upgrade to use this template
                              </div>
                            </div>
                          )}

                          {freeLimitReached && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 px-5 text-center">
                              <div className="rounded-2xl bg-white/95 px-4 py-3 text-sm font-semibold text-slate-900 shadow-xl">
                                Free plan sheet limit reached
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-950">
                              {template.name}
                            </h3>
                          </div>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {template.category}
                          </span>
                        </div>

                        <p className="text-sm leading-6 text-slate-600">
                          {template.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <span
                            className={`text-sm font-semibold ${
                              disabled
                                ? "text-slate-400"
                                : "text-cyan-700 group-hover:text-violet-700"
                            }`}
                          >
                            {locked
                              ? "Pro required"
                              : freeLimitReached
                              ? "Limit reached"
                              : "Use this template"}
                          </span>

                          <span
                            className={`text-sm transition ${
                              disabled
                                ? "text-slate-300"
                                : "text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600"
                            }`}
                          >
                            →
                          </span>
                        </div>
                      </div>
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}