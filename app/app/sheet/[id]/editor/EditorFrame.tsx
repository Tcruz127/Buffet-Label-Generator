"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import UpgradeModal from "@/app/app/UpgradeModal";

type LabelData = {
  id?: string;
  title?: string;
  description?: string;
  diets?: string[];
  foodName?: string;
};

type SheetSettings = {
  font?: string;
  fontSize?: string | number;
  textColor?: string;
  allergenFont?: string;
  allergenSize?: string | number;
  allergenColor?: string;
  descSize?: string | number;
  bgColor?: string;
  logoSettings?: {
    x: number;
    y: number;
    size: number;
  };
  viewMode?: string;
};

type SheetData = {
  id: string;
  name?: string;
  title?: string;
  eventName?: string;
  totalLabels?: number;
  settings?: SheetSettings | null;
  logoData?: string | null;
  logoUrl?: string | null;
  labels?: LabelData[];
  items?: LabelData[];
};

type ParsedMenuItem = {
  title: string;
  description: string;
  raw: string;
};

type ParsedMenuResponse = {
  success: boolean;
  fileName?: string;
  rawText?: string;
  items?: ParsedMenuItem[];
  error?: string;
};

type ChefBotAnalyzeResponse = {
  success: boolean;
  matchedIngredients?: string[];
  suggestedDiets?: string[];
  possibleDiets?: string[];
  cannotVerify?: string[];
  confidence?: "low" | "medium" | "high";
  reasoning?: string;
  warnings?: string;
  analysisId?: string;
  error?: string;
};

type ChefBotLabelAnalysis = {
  index: number;
  labelId?: string;
  title: string;
  description: string;
  matchedIngredients: string[];
  suggestedDiets: string[];
  possibleDiets: string[];
  cannotVerify: string[];
  confidence: "low" | "medium" | "high";
  reasoning: string;
  warnings: string;
  analysisId?: string;
  error?: string;
};

type NormalizedLabel = {
  id?: string;
  title: string;
  description: string;
  diets: string[];
};

type NormalizedSheetPayload = {
  id: string;
  name: string;
  title: string;
  eventName: string;
  totalLabels: number;
  settings: SheetSettings;
  logoData: string | null;
  labels: NormalizedLabel[];
};

function normalizeSheetPayload(sheet: SheetData): NormalizedSheetPayload {
  const normalizedLabels: LabelData[] = sheet.labels ?? sheet.items ?? [];

  return {
    id: sheet.id,
    name: sheet.name ?? sheet.title ?? "Untitled Sheet",
    title: sheet.title ?? sheet.name ?? "Untitled Sheet",
    eventName: sheet.eventName ?? "",
    totalLabels: sheet.totalLabels ?? 10,
    settings: sheet.settings ?? {},
    logoData: sheet.logoData ?? sheet.logoUrl ?? null,
    labels: normalizedLabels.map((label) => ({
      id: label.id,
      title: label.title ?? label.foodName ?? "",
      description: label.description ?? "",
      diets: Array.isArray(label.diets) ? label.diets : [],
    })),
  };
}

function getParsedMenuItemKey(item: ParsedMenuItem): string {
  return `${item.title}||${item.description}||${item.raw}`;
}

function getConfidenceTone(confidence: "low" | "medium" | "high") {
  if (confidence === "high") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (confidence === "medium") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export default function EditorFrame({ sheet, isPro = false }: { sheet: SheetData; isPro?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuFileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef(sheet.name ?? sheet.title ?? "Untitled Sheet");

  const [saveStatus, setSaveStatus] = useState("Ready");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [title, setTitle] = useState(
    sheet.name ?? sheet.title ?? "Untitled Sheet"
  );
  const [currentSheet, setCurrentSheet] = useState<SheetData>(sheet);

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isParsingMenu, setIsParsingMenu] = useState(false);
  const [menuParseError, setMenuParseError] = useState<string | null>(null);
  const [parsedMenuFileName, setParsedMenuFileName] = useState<string | null>(
    null
  );
  const [parsedMenuItems, setParsedMenuItems] = useState<ParsedMenuItem[]>([]);
  const [selectedMenuItemKeys, setSelectedMenuItemKeys] = useState<string[]>(
    []
  );
  const [parsedMenuRawText, setParsedMenuRawText] = useState("");

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const [isChefBotModalOpen, setIsChefBotModalOpen] = useState(false);
  const [isChefBotAnalyzing, setIsChefBotAnalyzing] = useState(false);
  const [chefBotError, setChefBotError] = useState<string | null>(null);
  const [chefBotAnalyses, setChefBotAnalyses] = useState<ChefBotLabelAnalysis[]>(
    []
  );

  const normalizedSheetPayload = useMemo(
    () => normalizeSheetPayload(currentSheet),
    [currentSheet]
  );

  const latestEditorPayloadRef = useRef<{
    eventName?: string;
    labels?: Array<{
      food?: string;
      description?: string;
      diets?: string[];
    }>;
    settings?: unknown;
    logoData?: string | null;
  }>({
    eventName: normalizedSheetPayload.eventName,
    labels: normalizedSheetPayload.labels.map((label) => ({
      food: label.title ?? "",
      description: label.description ?? "",
      diets: label.diets ?? [],
    })),
    settings: normalizedSheetPayload.settings,
    logoData: normalizedSheetPayload.logoData,
  });

  useEffect(() => {
    setCurrentSheet(sheet);
    const nextTitle = sheet.name ?? sheet.title ?? "Untitled Sheet";
    setTitle(nextTitle);
    titleRef.current = nextTitle;
  }, [sheet]);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const formatSavedTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const sendSheetToIframe = (payload: NormalizedSheetPayload) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "LOAD_SHEET",
        payload,
      },
      window.location.origin
    );
  };

  const saveToDatabase = async (payload: {
    title?: string;
    eventName?: string;
    labels?: unknown[];
    settings?: unknown;
    logoData?: string | null;
  }) => {
    try {
      setSaveStatus("Saving...");

      const response = await fetch(`/api/sheets/${sheet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setSaveStatus("Saved");
      setLastSavedAt(formatSavedTime());
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("Save failed");
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const payloadForLoad = normalizeSheetPayload(sheet);

    const sendSheet = () => {
      sendSheetToIframe(payloadForLoad);
    };

    const timer = setTimeout(sendSheet, 300);

    iframe.addEventListener("load", sendSheet);

    return () => {
      clearTimeout(timer);
      iframe.removeEventListener("load", sendSheet);
    };
  }, [sheet]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data) return;

      if (event.data.type === "SAVE_SHEET") {
        latestEditorPayloadRef.current = event.data.payload;

        const nextEventName = event.data.payload?.eventName ?? "";
        const nextLabels = Array.isArray(event.data.payload?.labels)
          ? event.data.payload.labels
          : [];
        const nextSettings = event.data.payload?.settings ?? null;
        const nextLogoData = event.data.payload?.logoData ?? null;

        setCurrentSheet((prev) => ({
          ...prev,
          name: titleRef.current.trim() || "Untitled Sheet",
          title: titleRef.current.trim() || "Untitled Sheet",
          eventName: nextEventName,
          totalLabels: Math.max(10, nextLabels.length || prev.totalLabels || 10),
          settings:
            typeof nextSettings === "object" && nextSettings !== null
              ? (nextSettings as SheetSettings)
              : prev.settings ?? {},
          logoData: nextLogoData,
          labels: nextLabels.map((label: any, index: number) => ({
            id: prev.labels?.[index]?.id,
            title:
              typeof label?.food === "string"
                ? label.food
                : typeof label?.title === "string"
                ? label.title
                : "",
            description:
              typeof label?.description === "string"
                ? label.description
                : typeof label?.ingredients === "string"
                ? label.ingredients
                : "",
            diets: Array.isArray(label?.diets) ? label.diets : [],
          })),
        }));

        await saveToDatabase({
          title: titleRef.current.trim() || "Untitled Sheet",
          eventName: nextEventName,
          labels: nextLabels.map((label: any) => ({
            food:
              typeof label?.food === "string"
                ? label.food
                : typeof label?.title === "string"
                ? label.title
                : "",
            description:
              typeof label?.description === "string"
                ? label.description
                : typeof label?.ingredients === "string"
                ? label.ingredients
                : "",
            diets: Array.isArray(label?.diets) ? label.diets : [],
          })),
          settings: nextSettings,
          logoData: nextLogoData,
        });
      }

      if (event.data.type === "AUTOSAVE_STATUS") {
        if (event.data.payload === "dirty") {
          setSaveStatus("Editing...");
        }
      }

      if (event.data.type === "AUTOSAVE_SHEET") {
        latestEditorPayloadRef.current = event.data.payload;

        const nextEventName = event.data.payload?.eventName ?? "";
        const nextLabels = Array.isArray(event.data.payload?.labels)
          ? event.data.payload.labels
          : [];
        const nextSettings = event.data.payload?.settings ?? null;
        const nextLogoData = event.data.payload?.logoData ?? null;

        setCurrentSheet((prev) => ({
          ...prev,
          name: titleRef.current.trim() || "Untitled Sheet",
          title: titleRef.current.trim() || "Untitled Sheet",
          eventName: nextEventName,
          totalLabels: Math.max(10, nextLabels.length || prev.totalLabels || 10),
          settings:
            typeof nextSettings === "object" && nextSettings !== null
              ? (nextSettings as SheetSettings)
              : prev.settings ?? {},
          logoData: nextLogoData,
          labels: nextLabels.map((label: any, index: number) => ({
            id: prev.labels?.[index]?.id,
            title:
              typeof label?.food === "string"
                ? label.food
                : typeof label?.title === "string"
                ? label.title
                : "",
            description:
              typeof label?.description === "string"
                ? label.description
                : typeof label?.ingredients === "string"
                ? label.ingredients
                : "",
            diets: Array.isArray(label?.diets) ? label.diets : [],
          })),
        }));

        await saveToDatabase({
          title: titleRef.current.trim() || "Untitled Sheet",
          eventName: nextEventName,
          labels: nextLabels.map((label: any) => ({
            food:
              typeof label?.food === "string"
                ? label.food
                : typeof label?.title === "string"
                ? label.title
                : "",
            description:
              typeof label?.description === "string"
                ? label.description
                : typeof label?.ingredients === "string"
                ? label.ingredients
                : "",
            diets: Array.isArray(label?.diets) ? label.diets : [],
          })),
          settings: nextSettings,
          logoData: nextLogoData,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [sheet.id]);

  const triggerTitleAutosave = (nextTitle: string) => {
    setSaveStatus("Editing...");

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      setCurrentSheet((prev) => ({
        ...prev,
        name: nextTitle.trim() || "Untitled Sheet",
        title: nextTitle.trim() || "Untitled Sheet",
      }));

      await saveToDatabase({
        title: nextTitle.trim() || "Untitled Sheet",
      });
    }, 1200);
  };

  const openMenuUpload = () => {
    setMenuParseError(null);
    menuFileInputRef.current?.click();
  };

  const toggleMenuItemSelection = (item: ParsedMenuItem) => {
    const key = getParsedMenuItemKey(item);

    setSelectedMenuItemKeys((prev) => {
      const exists = prev.includes(key);
      if (exists) {
        return prev.filter((entry) => entry !== key);
      }
      return [...prev, key];
    });
  };

  const selectAllMenuItems = () => {
    setSelectedMenuItemKeys(parsedMenuItems.map(getParsedMenuItemKey));
  };

  const clearAllMenuItems = () => {
    setSelectedMenuItemKeys([]);
  };

  const handleMenuFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setIsMenuModalOpen(true);
    setIsParsingMenu(true);
    setMenuParseError(null);
    setParsedMenuFileName(file.name);
    setParsedMenuItems([]);
    setSelectedMenuItemKeys([]);
    setParsedMenuRawText("");

    try {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          "File is too large. Please upload a file under 10MB."
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/menu/parse", {
        method: "POST",
        body: formData,
      });

      let result: ParsedMenuResponse;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText) as ParsedMenuResponse;
      } catch {
        if (response.status === 413) {
          throw new Error(
            "File is too large for the server to process. Please try a smaller file."
          );
        }
        throw new Error(
          `Unexpected server response (${response.status}). Please try again.`
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Menu parsing failed.");
      }

      const items = Array.isArray(result.items) ? result.items : [];
      const itemKeys = items.map(getParsedMenuItemKey);

      setParsedMenuFileName(result.fileName ?? file.name);
      setParsedMenuItems(items);
      setSelectedMenuItemKeys(itemKeys);
      setParsedMenuRawText(result.rawText ?? "");

      if (items.length === 0) {
        setMenuParseError(
          "No likely menu items were found in that file. Try another file or a cleaner menu format."
        );
      }
    } catch (error) {
      console.error("Menu parse failed:", error);
      setMenuParseError(
        error instanceof Error
          ? error.message
          : "Menu parsing failed. Please try again."
      );
    } finally {
      setIsParsingMenu(false);
    }
  };

  const importParsedMenuItems = async () => {
    const selectedItems = parsedMenuItems.filter((item) =>
      selectedMenuItemKeys.includes(getParsedMenuItemKey(item))
    );

    if (selectedItems.length === 0) {
      setMenuParseError("Select at least one menu item to import.");
      return;
    }

    const nextTotalLabels = Math.max(
      10,
      Math.ceil(selectedItems.length / 10) * 10
    );

    const nextLabels: NormalizedLabel[] = selectedItems.map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
      diets: [],
    }));

    const nextSheet: SheetData = {
      ...currentSheet,
      name: title.trim() || "Untitled Sheet",
      title: title.trim() || "Untitled Sheet",
      totalLabels: nextTotalLabels,
      labels: nextLabels,
    };

    setCurrentSheet(nextSheet);

    const nextPayload: NormalizedSheetPayload = {
      ...normalizedSheetPayload,
      name: title.trim() || "Untitled Sheet",
      title: title.trim() || "Untitled Sheet",
      totalLabels: nextTotalLabels,
      labels: nextLabels,
    };

    sendSheetToIframe(nextPayload);

    latestEditorPayloadRef.current = {
      eventName: nextPayload.eventName,
      labels: nextLabels.map((label) => ({
        food: label.title,
        description: label.description,
        diets: label.diets,
      })),
      settings: nextPayload.settings,
      logoData: nextPayload.logoData,
    };

    await saveToDatabase({
      title: title.trim() || "Untitled Sheet",
      eventName: nextPayload.eventName,
      labels: nextLabels.map((label) => ({
        food: label.title,
        description: label.description,
        diets: label.diets,
      })),
      settings: nextPayload.settings,
      logoData: nextPayload.logoData,
    });

    setIsMenuModalOpen(false);
  };

  const openChefBot = async () => {
    const labels = normalizedSheetPayload.labels;

    if (!labels.length) {
      setChefBotError("There are no labels to analyze.");
      setIsChefBotModalOpen(true);
      return;
    }

    setIsChefBotModalOpen(true);
    setIsChefBotAnalyzing(true);
    setChefBotError(null);
    setChefBotAnalyses([]);

    try {
      const results = await Promise.all(
        labels.map(async (label, index) => {
          try {
            const response = await fetch("/api/chef-bot/analyze", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                foodName: label.title,
                description: label.description,
                sheetId: normalizedSheetPayload.id,
                labelItemId: label.id,
              }),
            });

            const result =
              (await response.json()) as ChefBotAnalyzeResponse;

            if (!response.ok || !result.success) {
              return {
                index,
                labelId: label.id,
                title: label.title,
                description: label.description,
                matchedIngredients: [],
                suggestedDiets: [],
                possibleDiets: [],
                cannotVerify: [],
                confidence: "low" as const,
                reasoning: "",
                warnings: "",
                error: result.error || "Chef Bot analysis failed.",
              };
            }

            return {
              index,
              labelId: label.id,
              title: label.title,
              description: label.description,
              matchedIngredients: result.matchedIngredients ?? [],
              suggestedDiets: result.suggestedDiets ?? [],
              possibleDiets: result.possibleDiets ?? [],
              cannotVerify: result.cannotVerify ?? [],
              confidence: result.confidence ?? "low",
              reasoning: result.reasoning ?? "",
              warnings: result.warnings ?? "",
              analysisId: result.analysisId,
            };
          } catch (error) {
            return {
              index,
              labelId: label.id,
              title: label.title,
              description: label.description,
              matchedIngredients: [],
              suggestedDiets: [],
              possibleDiets: [],
              cannotVerify: [],
              confidence: "low" as const,
              reasoning: "",
              warnings: "",
              error:
                error instanceof Error
                  ? error.message
                  : "Chef Bot analysis failed.",
            };
          }
        })
      );

      setChefBotAnalyses(results);
    } catch (error) {
      console.error("Chef Bot batch analyze failed:", error);
      setChefBotError(
        error instanceof Error
          ? error.message
          : "Chef Bot analysis failed. Please try again."
      );
    } finally {
      setIsChefBotAnalyzing(false);
    }
  };

  const applyChefBotSuggestions = async () => {
    const baseLabels = normalizedSheetPayload.labels;

    if (!baseLabels.length) {
      setChefBotError("There are no labels to update.");
      return;
    }

    const nextLabels: NormalizedLabel[] = baseLabels.map((label, index) => {
      const analysis = chefBotAnalyses.find((entry) => entry.index === index);
      const existingDiets = Array.isArray(label.diets) ? label.diets : [];

      if (!analysis) {
        return {
          ...label,
          diets: existingDiets,
        };
      }

      const mergedDiets = uniqueStrings([
        ...existingDiets,
        ...(analysis.suggestedDiets ?? []),
      ]);

      return {
        ...label,
        diets: mergedDiets,
      };
    });

    const nextSheet: SheetData = {
      ...currentSheet,
      name: title.trim() || "Untitled Sheet",
      title: title.trim() || "Untitled Sheet",
      totalLabels: Math.max(10, nextLabels.length || currentSheet.totalLabels || 10),
      labels: nextLabels,
    };

    setCurrentSheet(nextSheet);

    const nextPayload: NormalizedSheetPayload = {
      ...normalizedSheetPayload,
      name: title.trim() || "Untitled Sheet",
      title: title.trim() || "Untitled Sheet",
      labels: nextLabels,
      totalLabels: Math.max(
        10,
        nextLabels.length || normalizedSheetPayload.totalLabels || 10
      ),
    };

    sendSheetToIframe(nextPayload);

    latestEditorPayloadRef.current = {
      eventName: nextPayload.eventName,
      labels: nextLabels.map((label) => ({
        food: label.title,
        description: label.description,
        diets: label.diets,
      })),
      settings: nextPayload.settings,
      logoData: nextPayload.logoData,
    };

    await saveToDatabase({
      title: title.trim() || "Untitled Sheet",
      eventName: nextPayload.eventName,
      labels: nextLabels.map((label) => ({
        food: label.title,
        description: label.description,
        diets: label.diets,
      })),
      settings: nextPayload.settings,
      logoData: nextPayload.logoData,
    });

    setIsChefBotModalOpen(false);
  };

  const statusText =
    saveStatus === "Saved" && lastSavedAt
      ? `Saved at ${lastSavedAt}`
      : saveStatus;

  const statusTone =
    saveStatus === "Save failed"
      ? "border-red-200 bg-red-50 text-red-700"
      : saveStatus === "Saving..."
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : saveStatus === "Editing..."
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(to_bottom,#f8fbff_0%,#f4f7fb_55%,#ffffff_100%)]">
        <div className="shrink-0 px-4 pt-4 lg:px-6">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  Editor Workspace
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setTitle(nextTitle);
                      triggerTitleAutosave(nextTitle);
                    }}
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xl font-black tracking-tight text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
                    placeholder="Untitled Sheet"
                  />

                  <div className="hidden text-sm text-slate-500 lg:block">
                    Design and manage your printable buffet label sheet
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isPro) { setIsUpgradeModalOpen(true); return; }
                    openMenuUpload();
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-800 shadow-sm transition hover:bg-violet-100"
                >
                  {!isPro && <span className="mr-1.5">🔒</span>}Upload Menu
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isPro) { setIsUpgradeModalOpen(true); return; }
                    openChefBot();
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100"
                >
                  {!isPro && <span className="mr-1.5">🔒</span>}Analyze with Chef Bot
                </button>

                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold shadow-sm ${statusTone}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />
                  <span>{statusText}</span>
                </div>

                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-4 pb-4 pt-4 lg:px-6">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="min-h-0 flex-1 overflow-hidden p-2">
              <iframe
                ref={iframeRef}
                src="/label-editor.html"
                title="Label Editor"
                className="block h-full w-full rounded-[1.4rem] border-0 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <input
        ref={menuFileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleMenuFileChange}
      />

      {isMenuModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    Menu Import
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">
                    Review extracted menu items
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Choose which items should become labels. Headers and
                    irrelevant lines are filtered automatically, and dish names
                    are separated from ingredient lines when possible.
                  </p>
                  {parsedMenuFileName ? (
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      File: {parsedMenuFileName}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openMenuUpload}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    Choose Another File
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMenuModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[1.2fr_.8fr]">
              <div className="min-h-0 border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
                {isParsingMenu ? (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                    <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-violet-500" />
                    <div className="text-lg font-bold text-slate-900">
                      Parsing menu...
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Extracting likely dish names from your uploaded file.
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Candidate labels
                        </h3>
                        <p className="text-sm text-slate-500">
                          {parsedMenuItems.length} item
                          {parsedMenuItems.length === 1 ? "" : "s"} found •{" "}
                          {selectedMenuItemKeys.length} selected
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={selectAllMenuItems}
                          disabled={parsedMenuItems.length === 0}
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={clearAllMenuItems}
                          disabled={selectedMenuItemKeys.length === 0}
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {menuParseError ? (
                      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {menuParseError}
                      </div>
                    ) : null}

                    <div className="min-h-0 flex-1 overflow-auto rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
                      {parsedMenuItems.length === 0 && !menuParseError ? (
                        <div className="flex h-full min-h-[240px] items-center justify-center text-center text-sm text-slate-500">
                          Upload a PDF, DOCX, or TXT menu to extract dishes.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {parsedMenuItems.map((item, index) => {
                            const itemKey = getParsedMenuItemKey(item);
                            const isSelected =
                              selectedMenuItemKeys.includes(itemKey);

                            return (
                              <label
                                key={`${itemKey}-${index}`}
                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                                  isSelected
                                    ? "border-violet-300 bg-violet-50"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleMenuItemSelection(item)}
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                />
                                <div className="min-w-0">
                                  <div className="break-words text-sm font-semibold text-slate-900">
                                    {item.title}
                                  </div>

                                  {item.description ? (
                                    <div className="mt-1 break-words text-sm text-slate-500">
                                      {item.description}
                                    </div>
                                  ) : null}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="min-h-0 p-6">
                <div className="flex h-full min-h-0 flex-col">
                  <h3 className="text-lg font-bold text-slate-900">
                    Raw extracted text
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    This helps you verify what the parser found in the file.
                  </p>

                  <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <pre className="whitespace-pre-wrap break-words text-xs leading-6 text-slate-700">
                      {parsedMenuRawText || "No extracted text to show yet."}
                    </pre>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5">
                    <div className="text-sm text-slate-600">
                      Importing will replace the current label names and
                      ingredient lines in this sheet with the selected menu
                      items.
                    </div>

                    <button
                      type="button"
                      onClick={importParsedMenuItems}
                      disabled={
                        isParsingMenu || selectedMenuItemKeys.length === 0
                      }
                      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Import {selectedMenuItemKeys.length} Item
                      {selectedMenuItemKeys.length === 1 ? "" : "s"} Into Labels
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      {isChefBotModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    Chef Bot
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">
                    Review dietary suggestions
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Chef Bot uses your dietary database to suggest likely
                    contains-tags. Review suggestions before applying them to
                    labels.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChefBotModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-6">
              {isChefBotAnalyzing ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                  <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
                  <div className="text-lg font-bold text-slate-900">
                    Chef Bot is analyzing your labels...
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    Checking ingredients against your dietary database.
                  </div>
                </div>
              ) : (
                <div className="flex min-h-0 flex-col">
                  {chefBotError ? (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {chefBotError}
                    </div>
                  ) : null}

                  {chefBotAnalyses.length === 0 && !chefBotError ? (
                    <div className="flex min-h-[240px] items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                      No Chef Bot analyses to show yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {chefBotAnalyses.map((analysis) => (
                        <div
                          key={`${analysis.index}-${analysis.labelId ?? analysis.title}`}
                          className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                        >
                          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="text-lg font-bold text-slate-950">
                                {analysis.title || "Untitled Label"}
                              </div>
                              {analysis.description ? (
                                <div className="mt-1 text-sm text-slate-500">
                                  {analysis.description}
                                </div>
                              ) : (
                                <div className="mt-1 text-sm italic text-slate-400">
                                  No ingredient line provided
                                </div>
                              )}
                            </div>

                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getConfidenceTone(
                                analysis.confidence
                              )}`}
                            >
                              {analysis.confidence} confidence
                            </span>
                          </div>

                          {analysis.error ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                              {analysis.error}
                            </div>
                          ) : (
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="space-y-4">
                                <div>
                                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                    Matched Ingredients
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.matchedIngredients.length ? (
                                      analysis.matchedIngredients.map((item) => (
                                        <span
                                          key={item}
                                          className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700"
                                        >
                                          {item}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-sm text-slate-500">
                                        None matched
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                    Suggested Diet Tags
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.suggestedDiets.length ? (
                                      analysis.suggestedDiets.map((item) => (
                                        <span
                                          key={item}
                                          className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                                        >
                                          {item}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-sm text-slate-500">
                                        No direct suggestions
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                    Possible Diet Tags
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.possibleDiets.length ? (
                                      analysis.possibleDiets.map((item) => (
                                        <span
                                          key={item}
                                          className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                                        >
                                          {item}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-sm text-slate-500">
                                        None
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                    Cannot Verify
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.cannotVerify.length ? (
                                      analysis.cannotVerify.map((item) => (
                                        <span
                                          key={item}
                                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                                        >
                                          {item}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-sm text-slate-500">
                                        No verification warnings
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                    Reasoning
                                  </div>
                                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                                    {analysis.reasoning || "No reasoning available."}
                                  </div>
                                </div>

                                <div>
                                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                    Warnings
                                  </div>
                                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                                    {analysis.warnings || "No warnings."}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-sm text-slate-600">
                  Applying suggestions will add Chef Bot’s direct suggested
                  contains-tags to your labels. Possible tags are shown for
                  review but are not auto-applied.
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChefBotModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyChefBotSuggestions}
                    disabled={
                      isChefBotAnalyzing ||
                      chefBotAnalyses.every(
                        (entry) => (entry.suggestedDiets ?? []).length === 0
                      )
                    }
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Apply Suggested Diets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}