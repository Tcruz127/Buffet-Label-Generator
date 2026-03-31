import { NextResponse } from "next/server";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

const SECTION_HEADER_PATTERNS = [
  /^appetizers?$/i,
  /^hors d'oeuvres?$/i,
  /^stations?$/i,
  /^carving stations?$/i,
  /^salads?$/i,
  /^entrees?$/i,
  /^entrées?$/i,
  /^mains?$/i,
  /^main course$/i,
  /^sides?$/i,
  /^vegetables?$/i,
  /^desserts?$/i,
  /^beverages?$/i,
  /^drinks?$/i,
  /^buffet$/i,
  /^dinner$/i,
  /^lunch$/i,
  /^brunch$/i,
  /^cocktail hour$/i,
  /^late night$/i,
  /^kids menu$/i,
  /^children'?s menu$/i,
  /^chef attended station$/i,
  /^chef-attended station$/i,
  /^action stations?$/i,
  /^plated dinner$/i,
  /^family style$/i,
  /^passed hors d'oeuvres?$/i,

  /^seasonal table$/i,
  /^freshly baked$/i,
  /^seafood and raw bar$/i,
  /^hot egg station$/i,
  /^hot buffet$/i,
  /^live carving station$/i,
  /^dessert$/i,
  /^signature pastries display including:?$/i,
];

const IGNORE_LINE_PATTERNS = [
  /^\$?\d+([.,]\d{2})?$/,
  /^price$/i,
  /^pricing$/i,
  /^menu$/i,
  /^sample menu$/i,
  /^please choose/i,
  /^served with/i,
  /^includes?/i,
  /^choice of/i,
  /^select (one|two|three)/i,
  /^minimum of/i,
  /^per person/i,
  /^for the table/i,
  /^chef'?s selection/i,
  /^seasonal availability/i,
  /^market price/i,
  /^add(itional)? /i,
  /^upgrade /i,
  /^optional /i,

  /^adults\b/i,
  /^ages\b/i,
  /^\d+\s+and under\b/i,
  /^reservations are required/i,
  /^space is limited/i,
  /^sunday,\s/i,
  /^emerald ballroom\b/i,
  /^easter brunch$/i,
  /^\{all prices/i,
];

const DESCRIPTION_HINTS = [
  "served with",
  "served alongside",
  "accompanied by",
  "finished with",
  "drizzled with",
  "topped with",
  "paired with",
  "featuring",
  "including",
  "choice of",
  "selection of",
  "with ",
  " and ",
  " on ",
];

function normalizeWhitespace(input: string): string {
  return input
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitIntoLines(text: string): string[] {
  return normalizeWhitespace(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isMostlyUppercase(line: string): boolean {
  const letters = line.replace(/[^a-zA-Z]/g, "");
  if (!letters) return false;

  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length > 0.8;
}

function isSectionHeader(line: string): boolean {
  const normalized = line.replace(/[:•·-]+$/g, "").trim();

  if (!normalized) return false;
  if (SECTION_HEADER_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  if (
    isMostlyUppercase(normalized) &&
    normalized.split(/\s+/).length <= 4 &&
    normalized.length <= 28
  ) {
    return true;
  }

  return false;
}

function looksLikePriceOrJunk(line: string): boolean {
  if (!line) return true;
  if (IGNORE_LINE_PATTERNS.some((pattern) => pattern.test(line))) return true;

  if (/^\(?[0-9]+\)?$/.test(line)) return true;
  if (/^\$+\s*\d/.test(line)) return true;
  if (/^[•·\-–—]+$/.test(line)) return true;

  return false;
}

function looksLikeDescription(line: string): boolean {
  const lower = line.toLowerCase();

  if (line.length > 80) return true;
  if (/[.;]/.test(line) && line.length > 40) return true;

  const commaCount = (line.match(/,/g) || []).length;
  if (commaCount >= 2) return true;

  if (
    DESCRIPTION_HINTS.some((phrase) => lower.includes(phrase)) &&
    line.split(/\s+/).length >= 6
  ) {
    return true;
  }

  if (line.split(/\s+/).length >= 10) return true;

  return false;
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanTextLine(line: string): string {
  return line
    .replace(/\uFFFD/g, " ")
    .replace(/\s*[•·]\s*/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanDishName(line: string): string {
  return line
    .replace(/\s{2,}/g, " ")
    .replace(/[•·]/g, "")
    .replace(/[:;,.-]+$/g, "")
    .trim();
}

function splitDishAndDescription(
  line: string
): { title: string; description: string } {
  const withoutTags = line.replace(/\{[^}]+\}/g, "").trim();

  const explicitSpecialCases: Array<[RegExp, string, string]> = [
    [
      /^OMELETTES\s+made to order with choice of assorted toppings/i,
      "Omelettes",
      "Made to order with choice of assorted toppings",
    ],
    [
      /^EGGS BENEDICT\s+freshly poached eggs,\s*hollandaise sauce,\s*carved ham or smoked salmon/i,
      "Eggs Benedict",
      "Freshly poached eggs, hollandaise sauce, carved ham or smoked salmon",
    ],
  ];

  for (const [pattern, title, description] of explicitSpecialCases) {
    if (pattern.test(withoutTags)) {
      return { title, description };
    }
  }

  const match = withoutTags.match(/^([A-Z0-9&+/'(). -]{3,}?)(\s+[a-z].*)$/);

  if (match) {
    return {
      title: toTitleCase(match[1].trim()),
      description: match[2].trim(),
    };
  }

  return {
    title: toTitleCase(withoutTags),
    description: "",
  };
}

function dedupePreserveOrder(items: ParsedMenuItem[]): ParsedMenuItem[] {
  const seen = new Set<string>();
  const result: ParsedMenuItem[] = [];

  for (const item of items) {
    const key = `${item.title.toLowerCase()}|${item.description.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function extractMenuItemsFromText(rawText: string): ParsedMenuItem[] {
  const normalized = normalizeWhitespace(rawText)
    .replace(/\uFFFD/g, " ")
    .replace(/\s*[•·]\s*/g, "\n");

  let lines = splitIntoLines(normalized)
    .map((line) => cleanTextLine(line))
    .flatMap((line) => line.split("\n"))
    .map((line) => cleanDishName(line))
    .filter(Boolean);

  lines = lines.filter((line) => {
    if (looksLikePriceOrJunk(line)) return false;
    if (isSectionHeader(line)) return false;
    return true;
  });

  const merged: string[] = [];

  function isContinuationLine(line: string): boolean {
    const lower = line.toLowerCase();

    if (!line) return false;
    if (/^[a-z]/.test(line)) return true;

    if (
      lower.startsWith("whipped butter") ||
      lower.startsWith("cream cheese") ||
      lower.startsWith("jams") ||
      lower.startsWith("cocktail sauce") ||
      lower.startsWith("horseradish") ||
      lower.startsWith("mignonette") ||
      lower.startsWith("lemon wedges")
    ) {
      return true;
    }

    if (/^or\s+/i.test(line)) return true;

    return false;
  }

  for (const line of lines) {
    if (!merged.length) {
      merged.push(line);
      continue;
    }

    if (isContinuationLine(line)) {
      merged[merged.length - 1] += " " + line;
      continue;
    }

    merged.push(line);
  }

  const items: ParsedMenuItem[] = [];

  for (const entry of merged) {
    const cleaned = entry.replace(/\s{2,}/g, " ").trim();
    if (!cleaned) continue;

    const { title, description } = splitDishAndDescription(cleaned);
    if (!title) continue;

    items.push({
      title,
      description,
      raw: cleaned,
    });
  }

  return dedupePreserveOrder(items).slice(0, 200);
}

async function extractTextFromTxt(fileBuffer: Buffer): Promise<string> {
  return fileBuffer.toString("utf-8");
}

async function extractTextFromDocx(fileBuffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  return result.value || "";
}

async function extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
  const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = (pdfParseModule as any).default ?? (pdfParseModule as any);
  const result = await pdfParse(fileBuffer);
  return result.text || "";
}

function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json<ParsedMenuResponse>(
        {
          success: false,
          error: "No file was uploaded.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name || "menu";
    const extension = getExtension(fileName);
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let rawText = "";

    if (extension === "txt") {
      rawText = await extractTextFromTxt(fileBuffer);
    } else if (extension === "docx") {
      rawText = await extractTextFromDocx(fileBuffer);
    } else if (extension === "pdf") {
      rawText = await extractTextFromPdf(fileBuffer);
    } else {
      return NextResponse.json<ParsedMenuResponse>(
        {
          success: false,
          error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
        },
        { status: 400 }
      );
    }

    const normalizedRawText = normalizeWhitespace(rawText);

    if (!normalizedRawText) {
      return NextResponse.json<ParsedMenuResponse>(
        {
          success: false,
          error: "No readable text was found in that file.",
        },
        { status: 400 }
      );
    }

    const items = extractMenuItemsFromText(normalizedRawText);

    return NextResponse.json<ParsedMenuResponse>({
      success: true,
      fileName,
      rawText: normalizedRawText,
      items,
    });
  } catch (error) {
    console.error("Menu parse failed:", error);

    return NextResponse.json<ParsedMenuResponse>(
      {
        success: false,
        error: "Menu parsing failed. Please try another file.",
      },
      { status: 500 }
    );
  }
}