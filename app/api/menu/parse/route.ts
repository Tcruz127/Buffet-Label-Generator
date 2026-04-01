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

  /^cold station$/i,
  /^hot station$/i,
  /^soup \+ salad$/i,
  /^salads? \+ sides$/i,
  /^beverages? & smoothies$/i,
  /^for the kids.*$/i,
  /^dessert.*$/i,
  /^entre[ée]s$/i,
  /^vinaigrette$/i,
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

  /^whipped butter\b/i,
  /^cream cheese\b/i,
  /^jams\b/i,
  /^cocktail sauce\b/i,
  /^horseradish\b/i,
  /^mignonette sauce\b/i,
  /^lemon wedges\b/i,

  /^adults\b/i,
  /^ages\b/i,
  /^\d+\s+and under\b/i,
  /^reservations are required/i,
  /^space is limited/i,
  /^sunday,\s/i,
  /^emerald ballroom\b/i,
  /^easter brunch$/i,
  /^\{all prices/i,

  /^banquet event order$/i,
  /^this beo was printed/i,
  /^beo #/i,
  /^event location:/i,
  /^event date:/i,
  /^beo name:/i,
  /^address:/i,
  /^booked by:/i,
  /^fax:/i,
  /^on-site contact:/i,
  /^email:/i,
  /^folio #:/i,
  /^room rental:/i,
  /^date time room function setup gtd set$/i,
  /^account:/i,
  /^contact:/i,
  /^phone:/i,
  /^audio visual$/i,
  /^beverage menu$/i,
  /^setup info \/ other info$/i,
  /^special instructions$/i,
  /^food menu$/i,

  /^\d+\s+serving$/i,
  /^\d+\s*@\s*\$?\s*\d/i,
  /^at \d{1,2}:\d{2}\s*(am|pm)\b/i,
  /^at \d{1,2}:\d{2}(am|pm)\b/i,
  /^please /i,
  /^golf fees$/i,
  /^bartender fee$/i,
  /^golf merchandise$/i,
  /^call cash bar$/i,
  /^setup:$/i,
  /^today'?s entertainment:/i,
  /^tonight'?s entertainment:/i,
  /^===+$/,
  /^-stage$/i,
  /^-mic$/i,
  /^-speaker$/i,
  /^-mixer$/i,
  /^- or .* -$/i,
  /^1 @ n\/c$/i,
  /^\*\*.*\*\*$/i,
  /^\*\* pricing is prior to discount \*\*$/i,
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

const BEO_SECTION_MARKERS = [
  /^food menu$/i,
  /^audio visual$/i,
  /^beverage menu$/i,
  /^setup info \/ other info$/i,
  /^special instructions$/i,
];

const BEO_BACKWARD_STOP_MARKERS = [
  /^date time room function setup gtd set$/i,
  /^folio #:/i,
  /^account:/i,
  /^phone:/i,
  /^banquet event order$/i,
  /^beo #/i,
  /^event location:/i,
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
  const letters = line.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  if (!letters) return false;

  const upper = letters.replace(/[^A-ZÀ-Þ]/g, "").length;
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
    normalized.length <= 32
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
  if (/^[•·\-–—=]+$/.test(line)) return true;

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
    .replace(/\s*\uFFFD\s*/g, "\n")
    .replace(/\s*[•·]\s*/g, "\n")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/â€“/g, "-")
    .replace(/Ã©/g, "é")
    .replace(/Ã/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanDishName(line: string): string {
  return line
    .replace(/^\*+|\*+$/g, "")
    .replace(/^=+|=+$/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[•·]/g, "")
    .replace(/[:;,.-]+$/g, "")
    .trim();
}

function splitDishAndDescription(
  line: string
): { title: string; description: string } {
  const withoutTags = line
    .replace(/\{[^}]+\}/g, "")
    .replace(/^\*+|\*+$/g, "")
    .trim();

  const explicitSpecialCases: Array<[RegExp, string, string]> = [
    [
      /^OMELETTES\s+made to order with choice of assorted toppings/i,
      "Omelettes",
      "Made to order with choice of assorted toppings",
    ],
    [
      /^EGGS BENEDICT\s+freshly poached eggs[\s|,]+carved ham or smoke?d salmon[\s|,]+lemon/i,
      "Eggs Benedict",
      "Freshly poached eggs, carved ham or smoked salmon, lemon hollandaise sauce",
    ],
    [
      /^BELGIAN WAFFLES AND PANCAKES\s*\(CHEF ATTENDED\)/i,
      "Belgian Waffles And Pancakes",
      "Chef attended",
    ],
    [
      /^HUEVOS RANCHEROS\s*\(CHEF ATTENDED\)/i,
      "Huevos Rancheros",
      "Chef attended",
    ],
  ];

  for (const [pattern, title, description] of explicitSpecialCases) {
    if (pattern.test(withoutTags)) {
      return { title, description };
    }
  }

  const unicodeUppercaseMatch = withoutTags.match(
    /^([\p{Lu}0-9&+/'(). -]{3,}?)(\s+[\p{Ll}].*)$/u
  );

  if (unicodeUppercaseMatch) {
    return {
      title: toTitleCase(unicodeUppercaseMatch[1].trim()),
      description: unicodeUppercaseMatch[2].trim(),
    };
  }

  const pipeOrCommaSplit = withoutTags.match(
    /^(.{3,60}?)\s+(?:\||,)\s*(.+)$/
  );

  if (pipeOrCommaSplit) {
    return {
      title: toTitleCase(pipeOrCommaSplit[1].trim()),
      description: pipeOrCommaSplit[2].trim(),
    };
  }

  const tokens = withoutTags.split(/\s+/);
  const firstLowercaseIndex = tokens.findIndex((token) =>
    /^[\p{Ll}]/u.test(token)
  );

  if (firstLowercaseIndex > 0) {
    const titleCandidate = tokens.slice(0, firstLowercaseIndex).join(" ").trim();
    const descriptionCandidate = tokens
      .slice(firstLowercaseIndex)
      .join(" ")
      .trim();

    if (
      titleCandidate &&
      descriptionCandidate &&
      titleCandidate.split(/\s+/).length <= 6 &&
      (descriptionCandidate.includes(",") ||
        descriptionCandidate.includes("|") ||
        descriptionCandidate.split(/\s+/).length >= 3)
    ) {
      return {
        title: toTitleCase(titleCandidate),
        description: descriptionCandidate,
      };
    }
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

function looksLikeBeoDocument(rawText: string): boolean {
  return (
    /banquet event order/i.test(rawText) &&
    /food menu/i.test(rawText) &&
    /(audio visual|beverage menu|setup info \/ other info|special instructions)/i.test(
      rawText
    )
  );
}

function isBeoSectionMarker(line: string): boolean {
  return BEO_SECTION_MARKERS.some((pattern) => pattern.test(line));
}

function isBeoBackwardStopMarker(line: string): boolean {
  return BEO_BACKWARD_STOP_MARKERS.some((pattern) => pattern.test(line));
}

function isLikelyBeoNoise(line: string): boolean {
  return (
    looksLikePriceOrJunk(line) ||
    /^at \d{1,2}:\d{2}\s*(am|pm)\b/i.test(line) ||
    /^at \d{1,2}:\d{2}(am|pm)\b/i.test(line) ||
    /^account:/i.test(line) ||
    /^folio #:/i.test(line) ||
    /^phone:/i.test(line) ||
    /^\d+\s+serving$/i.test(line) ||
    /^\d+\s*@\s*\$?\s*\d/i.test(line)
  );
}

function extractBeoFoodMenuText(rawText: string): string {
  const lines = splitIntoLines(rawText);
  const collectedBlocks: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!/^food menu$/i.test(line)) continue;

    const beforeBlock: string[] = [];
    for (let j = i - 1; j >= 0 && i - j <= 120; j -= 1) {
      const current = lines[j].trim();
      if (!current) continue;
      if (isBeoSectionMarker(current)) break;
      if (isBeoBackwardStopMarker(current)) break;
      beforeBlock.unshift(current);
    }

    const afterBlock: string[] = [];
    for (let j = i + 1; j < lines.length && j - i <= 120; j += 1) {
      const current = lines[j].trim();
      if (!current) continue;
      if (j !== i + 1 && isBeoSectionMarker(current)) break;
      if (/^account:/i.test(current)) break;
      if (/^folio #:/i.test(current)) break;
      if (/^phone:/i.test(current)) break;

      afterBlock.push(current);
    }

    const combined = [...beforeBlock, ...afterBlock]
      .filter((entry) => !isLikelyBeoNoise(entry))
      .join("\n")
      .trim();

    if (combined) {
      collectedBlocks.push(combined);
    }
  }

  return collectedBlocks.join("\n\n").trim();
}

function extractMenuItemsFromText(rawText: string): ParsedMenuItem[] {
  const menuSource = looksLikeBeoDocument(rawText)
    ? extractBeoFoodMenuText(rawText) || rawText
    : rawText;

  const normalized = normalizeWhitespace(menuSource)
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
    if (!line) return false;
    if (/^[a-z]/.test(line)) return true;
    if (/^or\s+/i.test(line)) return true;
    if (/^\|/.test(line)) return true;
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