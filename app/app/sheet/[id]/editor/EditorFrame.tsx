"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type LabelData = {
  id: string;
  title: string;
  description: string;
  diets: string[];
};

type SheetSettings = {
  font: string;
  fontSize: string | number;
  textColor: string;
  allergenFont: string;
  allergenSize: string | number;
  allergenColor: string;
  bgColor: string;
  logoSettings: {
    x: number;
    y: number;
    size: number;
  };
  viewMode: string;
};

type SheetData = {
  id: string;
  name: string;
  eventName: string;
  totalLabels: number;
  settings: SheetSettings;
  logoData: string | null;
  labels: LabelData[];
};

export default function EditorFrame({ sheet }: { sheet: SheetData }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [saveStatus, setSaveStatus] = useState("Ready");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [title, setTitle] = useState(sheet.name || "Untitled Sheet");

  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latestEditorPayloadRef = useRef<{
    eventName?: string;
    labels?: unknown[];
    settings?: unknown;
    logoData?: string | null;
  }>({
    eventName: sheet.eventName,
    labels: sheet.labels.map((label) => ({
      food: label.title,
      diets: label.diets,
    })),
    settings: sheet.settings,
    logoData: sheet.logoData,
  });

  useEffect(() => {
    setTitle(sheet.name || "Untitled Sheet");
  }, [sheet.name]);

  const formatSavedTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const sendSheet = () => {
      iframe.contentWindow?.postMessage(
        {
          type: "LOAD_SHEET",
          payload: sheet,
        },
        window.location.origin
      );
    };

    const saveToDatabase = async (payload: unknown) => {
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

    const buildPayloadWithTitle = (payload: {
      eventName?: string;
      labels?: unknown[];
      settings?: unknown;
      logoData?: string | null;
    }) => ({
      title: title.trim() || "Untitled Sheet",
      eventName: payload.eventName ?? "",
      labels: Array.isArray(payload.labels) ? payload.labels : [],
      settings: payload.settings ?? null,
      logoData: payload.logoData ?? null,
    });

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data) return;

      if (event.data.type === "SAVE_SHEET") {
        latestEditorPayloadRef.current = event.data.payload;
        await saveToDatabase(buildPayloadWithTitle(event.data.payload));
      }

      if (event.data.type === "AUTOSAVE_STATUS") {
        if (event.data.payload === "dirty") {
          setSaveStatus("Editing...");
        }
      }

      if (event.data.type === "AUTOSAVE_SHEET") {
        latestEditorPayloadRef.current = event.data.payload;
        await saveToDatabase(buildPayloadWithTitle(event.data.payload));
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
  }, [sheet, title]);

  const triggerTitleAutosave = (nextTitle: string) => {
    setSaveStatus("Editing...");

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus("Saving...");

        const response = await fetch(`/api/sheets/${sheet.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: nextTitle.trim() || "Untitled Sheet",
            eventName: latestEditorPayloadRef.current.eventName ?? "",
            labels: Array.isArray(latestEditorPayloadRef.current.labels)
              ? latestEditorPayloadRef.current.labels
              : [],
            settings: latestEditorPayloadRef.current.settings ?? null,
            logoData: latestEditorPayloadRef.current.logoData ?? null,
          }),
        });

        if (!response.ok) {
          throw new Error("Save failed");
        }

        setSaveStatus("Saved");
        setLastSavedAt(formatSavedTime());
      } catch (error) {
        console.error("Title save failed:", error);
        setSaveStatus("Save failed");
      }
    }, 1200);
  };

  const statusText =
    saveStatus === "Saved" && lastSavedAt
      ? `Saved at ${lastSavedAt}`
      : saveStatus;

  const statusTone =
    saveStatus === "Save failed"
      ? "border-red-400/20 bg-red-400/10 text-red-200"
      : saveStatus === "Saving..."
      ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
      : saveStatus === "Editing..."
      ? "border-sky-400/20 bg-sky-400/10 text-sky-200"
      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950/30">
      <div className="shrink-0 border-b border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const nextTitle = e.target.value;
              setTitle(nextTitle);
              triggerTitleAutosave(nextTitle);
            }}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base font-semibold tracking-tight text-white placeholder:text-slate-400 shadow-sm transition focus:border-cyan-300/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
            placeholder="Untitled Sheet"
          />

          <div
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold shadow-sm ${statusTone}`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />
            <span>{statusText}</span>
          </div>

          <Link
            href="/app"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-slate-900/40 p-2">
        <div className="h-full overflow-hidden rounded-[1.15rem] border border-white/10 bg-white shadow-inner">
          <iframe
            ref={iframeRef}
            src="/label-editor.html"
            title="Label Editor"
            className="h-full w-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}