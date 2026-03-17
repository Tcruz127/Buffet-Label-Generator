"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

export default function EditorFrame({ sheet }: { sheet: SheetData }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saveStatus, setSaveStatus] = useState("Ready");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [title, setTitle] = useState(
    sheet.name ?? sheet.title ?? "Untitled Sheet"
  );

  const normalizedSheetPayload = useMemo(() => {
    const normalizedLabels: LabelData[] = sheet.labels ?? sheet.items ?? [];

    return {
      ...sheet,
      name: sheet.name ?? sheet.title ?? "Untitled Sheet",
      title: sheet.title ?? sheet.name ?? "Untitled Sheet",
      eventName: sheet.eventName ?? "",
      settings: sheet.settings ?? {},
      logoData: sheet.logoData ?? sheet.logoUrl ?? null,
      labels: normalizedLabels.map((label) => ({
        id: label.id,
        title: label.title ?? label.foodName ?? "",
        description: label.description ?? "",
        diets: Array.isArray(label.diets) ? label.diets : [],
      })),
    };
  }, [sheet]);

  const latestEditorPayloadRef = useRef<{
    eventName?: string;
    labels?: unknown[];
    settings?: unknown;
    logoData?: string | null;
  }>({
    eventName: normalizedSheetPayload.eventName,
    labels: normalizedSheetPayload.labels.map((label) => ({
      food: label.title ?? "",
      diets: label.diets ?? [],
    })),
    settings: normalizedSheetPayload.settings,
    logoData: normalizedSheetPayload.logoData,
  });

  useEffect(() => {
    setTitle(sheet.name ?? sheet.title ?? "Untitled Sheet");
  }, [sheet.name, sheet.title]);

  const formatSavedTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
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

    const sendSheet = () => {
      iframe.contentWindow?.postMessage(
        {
          type: "LOAD_SHEET",
          payload: normalizedSheetPayload,
        },
        window.location.origin
      );
    };

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data) return;

      if (event.data.type === "SAVE_SHEET") {
        latestEditorPayloadRef.current = event.data.payload;

        await saveToDatabase({
          title: title.trim() || "Untitled Sheet",
          eventName: event.data.payload?.eventName ?? "",
          labels: Array.isArray(event.data.payload?.labels)
            ? event.data.payload.labels
            : [],
          settings: event.data.payload?.settings ?? null,
          logoData: event.data.payload?.logoData ?? null,
        });
      }

      if (event.data.type === "AUTOSAVE_STATUS") {
        if (event.data.payload === "dirty") {
          setSaveStatus("Editing...");
        }
      }

      if (event.data.type === "AUTOSAVE_SHEET") {
        latestEditorPayloadRef.current = event.data.payload;

        await saveToDatabase({
          title: title.trim() || "Untitled Sheet",
          eventName: event.data.payload?.eventName ?? "",
          labels: Array.isArray(event.data.payload?.labels)
            ? event.data.payload.labels
            : [],
          settings: event.data.payload?.settings ?? null,
          logoData: event.data.payload?.logoData ?? null,
        });
      }
    };

    const timer = setTimeout(sendSheet, 500);

    iframe.addEventListener("load", sendSheet);
    window.addEventListener("message", handleMessage);

    return () => {
      clearTimeout(timer);
      iframe.removeEventListener("load", sendSheet);
      window.removeEventListener("message", handleMessage);
    };
  }, [sheet.id, normalizedSheetPayload, title]);

  const triggerTitleAutosave = (nextTitle: string) => {
    setSaveStatus("Editing...");

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      await saveToDatabase({
        title: nextTitle.trim() || "Untitled Sheet",
      });
    }, 1200);
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
  );
}