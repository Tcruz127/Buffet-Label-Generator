import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnalyzeRequest = {
  foodName?: string;
  description?: string;
  sheetId?: string;
  labelItemId?: string;
};

type AnalyzeResponse = {
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

type IngredientRuleRecord = {
  id: string;
  ingredientName: string;
  normalizedName: string;
  containsGluten: boolean;
  containsDairy: boolean;
  containsEgg: boolean;
  containsSoy: boolean;
  containsNuts: boolean;
  containsShellfish: boolean;
  containsSesame: boolean;
  isVegetarian: boolean | null;
  isVegan: boolean | null;
  confidence: string | null;
  notes: string | null;
  source: string | null;
  verified: boolean;
};

type FoodDataCentralSearchResponse = {
  foods?: Array<{
    description?: string;
    ingredients?: string;
    additionalDescriptions?: {
      ingredients?: string;
    };
    lowercaseDescription?: string;
    brandOwner?: string;
    gtinUpc?: string;
  }>;
};

const POSSIBLE_NAME_ONLY_RULES: Array<{
  term: string;
  possibleDiets: string[];
  warning: string;
}> = [
  {
    term: "pesto",
    possibleDiets: ["Contains Nuts", "Contains Dairy"],
    warning:
      "Pesto often contains nuts and parmesan, but recipe details should be confirmed.",
  },
  {
    term: "aioli",
    possibleDiets: ["Contains Eggs"],
    warning:
      "Aioli typically contains egg, but recipe details should be confirmed.",
  },
  {
    term: "tempura",
    possibleDiets: ["Contains Gluten", "Contains Eggs"],
    warning:
      "Tempura batter often contains wheat and may contain egg; recipe details should be confirmed.",
  },
  {
    term: "teriyaki",
    possibleDiets: ["Contains Soy", "Contains Gluten"],
    warning:
      "Teriyaki sauce often contains soy sauce and may contain wheat.",
  },
  {
    term: "pizza",
    possibleDiets: ["Contains Gluten"],
    warning:
      "Pizza crust typically contains wheat unless explicitly marked gluten free.",
  },
  {
    term: "hollandaise",
    possibleDiets: ["Contains Eggs", "Contains Dairy"],
    warning:
      "Hollandaise usually contains egg and butter, but recipe details should be confirmed.",
  },
];

const DIRECT_TAG_RULES: Array<{
  terms: string[];
  diets: string[];
  note: string;
}> = [
  {
    terms: ["gluten free", "gf"],
    diets: [],
    note:
      "Free-from claims require recipe-level verification and are not auto-applied by Chef Bot.",
  },
  {
    terms: ["vegan", "vegetarian", "dairy free", "df"],
    diets: [],
    note:
      "Free-from and lifestyle claims require verification and are not auto-applied by Chef Bot.",
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[|/+]/g, " ")
    .replace(/-/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitIngredientChunks(value: string): string[] {
  if (!value.trim()) return [];

  return value
    .split(/[,|/+]/g)
    .map((part) => normalizeText(part))
    .filter(Boolean);
}

function containsPhrase(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return haystack.includes(needle);
}

function scoreRuleMatch(
  rule: IngredientRuleRecord,
  searchText: string,
  chunks: string[]
) {
  const normalizedRule = normalizeText(rule.normalizedName);
  if (!normalizedRule) return 0;

  if (chunks.some((chunk) => chunk === normalizedRule)) {
    return 4;
  }

  if (chunks.some((chunk) => containsPhrase(chunk, normalizedRule))) {
    return 3;
  }

  if (containsPhrase(searchText, normalizedRule)) {
    return 2;
  }

  const ruleTokens = tokenize(normalizedRule);
  if (!ruleTokens.length) return 0;

  const allTokensPresent = ruleTokens.every((token) => searchText.includes(token));
  if (allTokensPresent) {
    return 1;
  }

  return 0;
}

function dietsFromRule(rule: IngredientRuleRecord) {
  const suggested: string[] = [];

  if (rule.containsGluten) suggested.push("Contains Gluten");
  if (rule.containsDairy) suggested.push("Contains Dairy");
  if (rule.containsEgg) suggested.push("Contains Eggs");
  if (rule.containsSoy) suggested.push("Contains Soy");
  if (rule.containsNuts) suggested.push("Contains Nuts");
  if (rule.containsShellfish) suggested.push("Contains Shellfish");
  if (rule.containsSesame) suggested.push("Contains Sesame");

  return suggested;
}

function getConfidenceFromSignals(params: {
  matchedCount: number;
  suggestedCount: number;
  possibleCount: number;
  strongestMatchScore: number;
  hasDescription: boolean;
  usedExternalData: boolean;
}): "low" | "medium" | "high" {
  const {
    matchedCount,
    suggestedCount,
    possibleCount,
    strongestMatchScore,
    hasDescription,
    usedExternalData,
  } = params;

  if (
    hasDescription &&
    matchedCount >= 2 &&
    suggestedCount >= 1 &&
    strongestMatchScore >= 3 &&
    !usedExternalData
  ) {
    return "high";
  }

  if (
    matchedCount >= 1 ||
    suggestedCount >= 1 ||
    possibleCount >= 1 ||
    usedExternalData
  ) {
    return "medium";
  }

  return "low";
}

function extractIngredientKeywords(text: string): string[] {
  const normalized = normalizeText(text);

  if (!normalized) return [];

  return uniq([
    ...splitIngredientChunks(normalized),
    ...normalized.split(" ").filter((token) => token.length > 2),
  ]);
}

async function fetchFoodDataCentralIngredients(
  query: string
): Promise<{ ingredientsText: string; sourceNote: string } | null> {
  const apiKey = process.env.FOODDATA_CENTRAL_API_KEY;

  if (!apiKey) {
    return null;
  }

  const searchUrl = new URL(
    "https://api.nal.usda.gov/fdc/v1/foods/search"
  );
  searchUrl.searchParams.set("api_key", apiKey);

  const response = await fetch(searchUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      pageSize: 3,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as FoodDataCentralSearchResponse;
  const foods = Array.isArray(data.foods) ? data.foods : [];

  for (const food of foods) {
    const ingredientsText =
      food.ingredients?.trim() ||
      food.additionalDescriptions?.ingredients?.trim() ||
      "";

    if (ingredientsText) {
      return {
        ingredientsText,
        sourceNote: `External ingredient enrichment used from USDA FoodData Central for "${food.description || query}".`,
      };
    }
  }

  return null;
}

async function runLocalRuleAnalysis(params: {
  foodName: string;
  description: string;
  rules: IngredientRuleRecord[];
}) {
  const { foodName, description, rules } = params;

  const searchText = normalizeText([foodName, description].filter(Boolean).join(" "));
  const descriptionText = normalizeText(description);
  const foodNameText = normalizeText(foodName);
  const descriptionChunks = splitIngredientChunks(description);

  const scoredMatches = rules
    .map((rule) => ({
      rule,
      score: scoreRuleMatch(rule, searchText, descriptionChunks),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const strongestMatchScore = scoredMatches[0]?.score ?? 0;
  const matchedRules = scoredMatches.map((entry) => entry.rule);
  const matchedIngredients = uniq(
    matchedRules.map((rule) => rule.ingredientName)
  );
  const suggestedDiets = uniq(
    matchedRules.flatMap((rule) => dietsFromRule(rule))
  );

  const possibleDiets: string[] = [];
  const cannotVerify: string[] = [];
  const reasoningParts: string[] = [];
  const warningParts: string[] = [];

  for (const rule of matchedRules) {
    if (rule.notes) {
      reasoningParts.push(`${rule.ingredientName}: ${rule.notes}`);
    } else {
      reasoningParts.push(
        `${rule.ingredientName}: matched dietary rule in database.`
      );
    }
  }

  for (const rule of POSSIBLE_NAME_ONLY_RULES) {
    if (containsPhrase(foodNameText, normalizeText(rule.term))) {
      possibleDiets.push(...rule.possibleDiets);
      warningParts.push(rule.warning);
    }
  }

  for (const directRule of DIRECT_TAG_RULES) {
    if (
      directRule.terms.some((term) =>
        containsPhrase(searchText, normalizeText(term))
      )
    ) {
      warningParts.push(directRule.note);
    }
  }

  if (!description) {
    cannotVerify.push(
      "Cannot verify complete allergen profile without ingredient details."
    );
    warningParts.push(
      "Ingredient line is blank. Chef Bot can only make limited suggestions from the dish name."
    );
  }

  if (description && matchedIngredients.length === 0) {
    warningParts.push(
      "No known ingredient rules matched the provided description."
    );
  }

  if (description && matchedIngredients.length > 0 && suggestedDiets.length === 0) {
    warningParts.push(
      "Some ingredients were recognized, but they do not currently map to tracked contains-tags."
    );
  }

  return {
    matchedIngredients,
    suggestedDiets,
    possibleDiets,
    cannotVerify,
    reasoningParts,
    warningParts,
    strongestMatchScore,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    const foodName = typeof body.foodName === "string" ? body.foodName.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const sheetId = typeof body.sheetId === "string" ? body.sheetId : undefined;
    const labelItemId =
      typeof body.labelItemId === "string" ? body.labelItemId : undefined;

    if (!foodName && !description) {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: "Food name or description is required.",
        },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/prisma");

    const rules = (await prisma.ingredientRule.findMany({
      orderBy: { ingredientName: "asc" },
    })) as IngredientRuleRecord[];

    let analysis = await runLocalRuleAnalysis({
      foodName,
      description,
      rules,
    });

    let usedExternalData = false;
    let externalSourceNote = "";

    const weakLocalSignal =
      analysis.matchedIngredients.length === 0 ||
      (analysis.suggestedDiets.length === 0 && Boolean(description));

    if (weakLocalSignal) {
      const enrichmentQuery = description || foodName;
      const external = await fetchFoodDataCentralIngredients(enrichmentQuery);

      if (external?.ingredientsText) {
        usedExternalData = true;
        externalSourceNote = external.sourceNote;

        const enrichedDescription = description
          ? `${description}, ${external.ingredientsText}`
          : external.ingredientsText;

        analysis = await runLocalRuleAnalysis({
          foodName,
          description: enrichedDescription,
          rules,
        });

        analysis.warningParts.push(
          "Chef Bot used an external ingredient reference to enrich this analysis. Review before relying on it."
        );
      }
    }

    const uniqueSuggestedDiets = uniq(analysis.suggestedDiets);
    const uniquePossibleDiets = uniq(
      analysis.possibleDiets.filter((diet) => !uniqueSuggestedDiets.includes(diet))
    );
    const uniqueCannotVerify = uniq(analysis.cannotVerify);

    const confidence = getConfidenceFromSignals({
      matchedCount: analysis.matchedIngredients.length,
      suggestedCount: uniqueSuggestedDiets.length,
      possibleCount: uniquePossibleDiets.length,
      strongestMatchScore: analysis.strongestMatchScore,
      hasDescription: Boolean(description),
      usedExternalData,
    });

    const reasoning = uniq([
      ...analysis.reasoningParts,
      externalSourceNote,
    ]).filter(Boolean).join(" ") ||
      "No strong ingredient matches were found in the dietary database.";

    const warnings =
      uniq(analysis.warningParts).filter(Boolean).join(" ") || "";

    let analysisId: string | undefined;

    if (sheetId) {
      const saved = await prisma.dishAnalysis.create({
        data: {
          sheetId,
          labelItemId: labelItemId ?? null,
          foodName: foodName || null,
          description: description || null,
          matchedIngredients: analysis.matchedIngredients,
          suggestedDiets: uniqueSuggestedDiets,
          possibleDiets: uniquePossibleDiets,
          cannotVerify: uniqueCannotVerify,
          confidence,
          reasoning,
          warnings: warnings || null,
          status: "suggested",
        },
      });

      analysisId = saved.id;
    }

    return NextResponse.json<AnalyzeResponse>({
      success: true,
      matchedIngredients: analysis.matchedIngredients,
      suggestedDiets: uniqueSuggestedDiets,
      possibleDiets: uniquePossibleDiets,
      cannotVerify: uniqueCannotVerify,
      confidence,
      reasoning,
      warnings,
      analysisId,
    });
  } catch (error) {
    console.error("Chef Bot analyze failed:", error);

    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        error: "Chef Bot analysis failed. Please try again.",
      },
      { status: 500 }
    );
  }
}