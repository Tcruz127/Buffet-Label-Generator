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
  containsFish: boolean;
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
    warning: "Pesto often contains nuts and parmesan; recipe details should be confirmed.",
  },
  {
    term: "aioli",
    possibleDiets: ["Contains Eggs"],
    warning: "Aioli typically contains egg; recipe details should be confirmed.",
  },
  {
    term: "tempura",
    possibleDiets: ["Contains Gluten", "Contains Eggs"],
    warning: "Tempura batter often contains wheat and may contain egg; recipe details should be confirmed.",
  },
  {
    term: "teriyaki",
    possibleDiets: ["Contains Soy", "Contains Gluten"],
    warning: "Teriyaki sauce often contains soy sauce and may contain wheat.",
  },
  {
    term: "pizza",
    possibleDiets: ["Contains Gluten"],
    warning: "Pizza crust typically contains wheat unless explicitly marked gluten-free.",
  },
  {
    term: "hollandaise",
    possibleDiets: ["Contains Eggs", "Contains Dairy"],
    warning: "Hollandaise usually contains egg and butter; recipe details should be confirmed.",
  },
  {
    term: "caesar",
    possibleDiets: ["Contains Eggs", "Contains Fish"],
    warning: "Traditional Caesar dressing contains egg and anchovy; verify recipe.",
  },
  {
    term: "bisque",
    possibleDiets: ["Contains Dairy", "Contains Shellfish"],
    warning: "Bisque is typically a cream-based shellfish soup; verify recipe.",
  },
  {
    term: "bouillabaisse",
    possibleDiets: ["Contains Shellfish", "Contains Fish"],
    warning: "Bouillabaisse typically contains shellfish and fish; verify recipe.",
  },
  {
    term: "soufflé",
    possibleDiets: ["Contains Eggs", "Contains Dairy"],
    warning: "Soufflé contains egg and dairy; recipe details should be confirmed.",
  },
  {
    term: "souffle",
    possibleDiets: ["Contains Eggs", "Contains Dairy"],
    warning: "Soufflé contains egg and dairy; recipe details should be confirmed.",
  },
  {
    term: "béarnaise",
    possibleDiets: ["Contains Eggs", "Contains Dairy"],
    warning: "Béarnaise sauce contains egg yolks and clarified butter.",
  },
  {
    term: "bearnaise",
    possibleDiets: ["Contains Eggs", "Contains Dairy"],
    warning: "Béarnaise sauce contains egg yolks and clarified butter.",
  },
  {
    term: "schnitzel",
    possibleDiets: ["Contains Gluten", "Contains Eggs"],
    warning: "Schnitzel is breaded in wheat breadcrumbs and egg wash; verify recipe.",
  },
  {
    term: "katsu",
    possibleDiets: ["Contains Gluten", "Contains Eggs"],
    warning: "Katsu is breaded in panko and egg; verify recipe.",
  },
  {
    term: "tonkatsu",
    possibleDiets: ["Contains Gluten", "Contains Eggs"],
    warning: "Tonkatsu is breaded in panko and egg; verify recipe.",
  },
  {
    term: "pad thai",
    possibleDiets: ["Contains Gluten", "Contains Eggs", "Contains Nuts"],
    warning: "Pad thai often contains soy sauce, egg, and peanuts; verify recipe.",
  },
  {
    term: "satay",
    possibleDiets: ["Contains Nuts"],
    warning: "Satay is typically served with peanut sauce; verify recipe.",
  },
  {
    term: "paella",
    possibleDiets: ["Contains Shellfish", "Contains Fish"],
    warning: "Paella typically contains shellfish and/or fish; verify recipe.",
  },
  {
    term: "quiche",
    possibleDiets: ["Contains Eggs", "Contains Dairy", "Contains Gluten"],
    warning: "Quiche contains egg, dairy, and a wheat pastry crust.",
  },
  {
    term: "risotto",
    possibleDiets: ["Contains Dairy"],
    warning: "Risotto is typically finished with butter and parmesan; verify recipe.",
  },
  {
    term: "stroganoff",
    possibleDiets: ["Contains Dairy"],
    warning: "Stroganoff typically contains sour cream; verify recipe.",
  },
  {
    term: "croquette",
    possibleDiets: ["Contains Gluten", "Contains Dairy", "Contains Eggs"],
    warning: "Croquettes typically contain breadcrumbs, dairy filling, and egg wash.",
  },
  {
    term: "mole",
    possibleDiets: ["Contains Nuts"],
    warning: "Mole sauce often contains almonds, peanuts, or other nuts; verify recipe.",
  },
  {
    term: "romesco",
    possibleDiets: ["Contains Nuts"],
    warning: "Romesco sauce is typically made with almonds or hazelnuts.",
  },
  {
    term: "profiterole",
    possibleDiets: ["Contains Gluten", "Contains Dairy", "Contains Eggs"],
    warning: "Profiteroles are choux pastry filled with cream — contain gluten, dairy, and egg.",
  },
  {
    term: "eclair",
    possibleDiets: ["Contains Gluten", "Contains Dairy", "Contains Eggs"],
    warning: "Éclairs are choux pastry filled with cream — contain gluten, dairy, and egg.",
  },
  {
    term: "choux",
    possibleDiets: ["Contains Gluten", "Contains Dairy", "Contains Eggs"],
    warning: "Choux pastry contains wheat, butter, and egg.",
  },
  {
    term: "crème brûlée",
    possibleDiets: ["Contains Eggs", "Contains Dairy"],
    warning: "Crème brûlée contains cream and egg yolks.",
  },
  {
    term: "creme brulee",
    possibleDiets: ["Contains Eggs", "Contains Dairy"],
    warning: "Crème brûlée contains cream and egg yolks.",
  },
  {
    term: "ramen",
    possibleDiets: ["Contains Gluten"],
    warning: "Ramen noodles are wheat-based; broth may also contain soy.",
  },
  {
    term: "chimichanga",
    possibleDiets: ["Contains Gluten"],
    warning: "Chimichangas are fried in flour tortillas and contain gluten.",
  },
  {
    term: "enchilada",
    possibleDiets: ["Contains Gluten", "Contains Dairy"],
    warning: "Enchiladas use flour or corn tortillas and often contain cheese; verify recipe.",
  },
  {
    term: "quesadilla",
    possibleDiets: ["Contains Gluten", "Contains Dairy"],
    warning: "Quesadillas use flour tortillas and cheese.",
  },
  {
    term: "burrito",
    possibleDiets: ["Contains Gluten"],
    warning: "Burritos are wrapped in flour tortillas and contain gluten.",
  },
  {
    term: "fried chicken",
    possibleDiets: ["Contains Gluten", "Contains Eggs"],
    warning: "Fried chicken is typically coated in wheat flour and egg wash.",
  },
  {
    term: "beurre blanc",
    possibleDiets: ["Contains Dairy"],
    warning: "Beurre blanc is a butter-based sauce and contains dairy.",
  },
  {
    term: "vol au vent",
    possibleDiets: ["Contains Gluten", "Contains Dairy"],
    warning: "Vol-au-vent shells are made from puff pastry containing wheat and butter.",
  },
  {
    term: "borek",
    possibleDiets: ["Contains Gluten", "Contains Dairy"],
    warning: "Börek uses phyllo dough and often contains cheese; contains gluten and dairy.",
  },
  {
    term: "spanakopita",
    possibleDiets: ["Contains Gluten", "Contains Dairy", "Contains Eggs"],
    warning: "Spanakopita uses phyllo dough and contains feta, egg, gluten, and dairy.",
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
    .replace(/[()]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singularize(word: string): string {
  const value = normalizeText(word);

  if (value.endsWith("ies") && value.length > 3) {
    return value.slice(0, -3) + "y";
  }

  if (value.endsWith("es") && value.length > 3) {
    return value.slice(0, -2);
  }

  if (value.endsWith("s") && value.length > 2) {
    return value.slice(0, -1);
  }

  return value;
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => singularize(part));
}

function splitIngredientChunks(value: string): string[] {
  if (!value.trim()) return [];

  const normalized = value
    .replace(/[|]/g, ",")
    .replace(/[+]/g, ",")
    .replace(/[;]/g, ",")
    .replace(/[\/]/g, ",")
    .replace(/\s+-\s+/g, ",")
    .replace(/\s+\band\b\s+/gi, ",")
    .split(",");

  return normalized
    .map((part) => normalizeText(part))
    .filter(Boolean);
}

function containsPhrase(haystack: string, needle: string): boolean {
  const h = normalizeText(haystack);
  const n = normalizeText(needle);

  if (!h || !n) return false;
  if (h.includes(n)) return true;

  const hTokens = tokenize(h);
  const nTokens = tokenize(n);

  if (!nTokens.length) return false;

  return nTokens.every((token) => hTokens.includes(token));
}

function scoreRuleMatch(
  rule: IngredientRuleRecord,
  searchText: string,
  chunks: string[]
) {
  const normalizedRule = normalizeText(rule.normalizedName);
  if (!normalizedRule) return 0;

  const normalizedSearch = normalizeText(searchText);
  const ruleTokens = tokenize(normalizedRule);

  if (!ruleTokens.length) return 0;

  const normalizedChunks = chunks.map((chunk) => normalizeText(chunk));

  // strongest: exact chunk match
  if (normalizedChunks.some((chunk) => chunk === normalizedRule)) {
    return 5;
  }

  // very strong: whole phrase appears inside a chunk
  if (normalizedChunks.some((chunk) => chunk.includes(normalizedRule))) {
    return 4;
  }

  // strong: all tokens from the rule appear in a single chunk
  if (
    normalizedChunks.some((chunk) => {
      const chunkTokens = tokenize(chunk);
      return ruleTokens.every((token) => chunkTokens.includes(token));
    })
  ) {
    return 3;
  }

  // medium: phrase appears anywhere in full text
  if (normalizedSearch.includes(normalizedRule)) {
    return 2;
  }

  // weaker: all rule tokens appear somewhere in the full text
  {
    const searchTokens = tokenize(normalizedSearch);
    if (ruleTokens.every((token) => searchTokens.includes(token))) {
      return 1;
    }
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
  if (rule.containsFish) suggested.push("Contains Fish");

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
  const combinedChunks = uniq([
    ...descriptionChunks,
    ...splitIngredientChunks(foodName),
    searchText,
  ]);

  const scoredMatches = rules
    .map((rule) => ({
      rule,
      score: scoreRuleMatch(rule, searchText, combinedChunks),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const strongestMatchScore = scoredMatches[0]?.score ?? 0;

  const matchedRules = uniq(
    scoredMatches.map((entry) => entry.rule.normalizedName)
  ).map((normalizedName) =>
    scoredMatches.find((entry) => entry.rule.normalizedName === normalizedName)!.rule
  );

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
    if (containsPhrase(foodNameText, rule.term)) {
      possibleDiets.push(...rule.possibleDiets);
      warningParts.push(rule.warning);
    }
  }

  for (const directRule of DIRECT_TAG_RULES) {
    if (
      directRule.terms.some((term) =>
        containsPhrase(searchText, term)
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

  // Smart phrase boosts — high-confidence compound ingredient patterns
  const phraseBoosts: Array<{
    phrase: string;
    diets: string[];
    reasoning: string;
    cannotVerify?: string;
  }> = [
    {
      phrase: "flour tortilla",
      diets: ["Contains Gluten"],
      reasoning: "Flour tortilla: contains wheat gluten.",
    },
    {
      phrase: "mozzarella cheese",
      diets: ["Contains Dairy"],
      reasoning: "Mozzarella cheese: contains dairy.",
    },
    {
      phrase: "beurre blanc",
      diets: ["Contains Dairy"],
      reasoning: "Beurre blanc: butter-based sauce, contains dairy.",
    },
    {
      phrase: "cream sauce",
      diets: ["Contains Dairy"],
      reasoning: "Cream sauce: contains dairy.",
    },
    {
      phrase: "cheese sauce",
      diets: ["Contains Dairy"],
      reasoning: "Cheese sauce: contains dairy.",
    },
    {
      phrase: "egg wash",
      diets: ["Contains Eggs"],
      reasoning: "Egg wash: contains egg.",
    },
    {
      phrase: "egg noodle",
      diets: ["Contains Gluten", "Contains Eggs"],
      reasoning: "Egg noodles: contain wheat and egg.",
    },
    {
      phrase: "peanut sauce",
      diets: ["Contains Nuts"],
      reasoning: "Peanut sauce: contains peanuts.",
    },
    {
      phrase: "fish sauce",
      diets: ["Contains Fish"],
      reasoning: "Fish sauce: contains fish allergen.",
    },
    {
      phrase: "anchovy paste",
      diets: ["Contains Fish"],
      reasoning: "Anchovy paste: contains fish allergen.",
    },
    {
      phrase: "caesar dressing",
      diets: ["Contains Eggs", "Contains Fish"],
      reasoning: "Caesar dressing: traditionally contains egg and anchovy.",
    },
    {
      phrase: "bread crumb",
      diets: ["Contains Gluten"],
      reasoning: "Breadcrumbs: contain wheat gluten.",
    },
    {
      phrase: "soy glaze",
      diets: ["Contains Soy", "Contains Gluten"],
      reasoning: "Soy glaze: contains soy sauce and typically wheat.",
    },
    {
      phrase: "miso butter",
      diets: ["Contains Soy", "Contains Dairy"],
      reasoning: "Miso butter: contains soy (miso) and dairy (butter).",
    },
    {
      phrase: "corn tortilla",
      diets: [],
      reasoning: "",
      cannotVerify:
        "Corn tortilla may still require brand/recipe verification for gluten-free claims.",
    },
  ];

  for (const boost of phraseBoosts) {
    if (containsPhrase(searchText, boost.phrase)) {
      for (const diet of boost.diets) {
        if (!suggestedDiets.includes(diet)) {
          suggestedDiets.push(diet);
        }
      }
      if (boost.reasoning) {
        reasoningParts.push(boost.reasoning);
      }
      if (boost.cannotVerify) {
        cannotVerify.push(boost.cannotVerify);
      }
    }
  }

  return {
    matchedIngredients: uniq(matchedIngredients),
    suggestedDiets: uniq(suggestedDiets),
    possibleDiets: uniq(possibleDiets),
    cannotVerify: uniq(cannotVerify),
    reasoningParts: uniq(reasoningParts),
    warningParts: uniq(warningParts),
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
    })) as unknown as IngredientRuleRecord[];

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