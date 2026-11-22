// Supplies shown on the public Shop page (/shop).
// Directional signage is a Crystal Springs-only feature, so nothing here is for signs.

/**
 * Amazon Associates tracking tag (e.g. "instabels-20"). Leave empty until the
 * account is approved; once set, every Shop link carries it and the required
 * Associates disclosure appears on the page.
 */
export const AMAZON_ASSOCIATE_TAG = "";

/** Amazon search link for a product, tagged when an Associates tag is configured. */
export function amazonSearchUrl(query: string) {
  const params = new URLSearchParams({ k: query });
  if (AMAZON_ASSOCIATE_TAG) params.set("tag", AMAZON_ASSOCIATE_TAG);
  return `https://www.amazon.com/s?${params.toString()}`;
}

/** Sheet layout drawn on the product card (inches, letter portrait page). */
export type SheetLayout =
  | { kind: "labels"; columns: number; rows: number; labelWidth: number; labelHeight: number }
  | { kind: "menu-halves" }
  | { kind: "single-card" };

export type ShopProduct = {
  name: string;
  detail: string;
  /** Which Instabels feature or print format this works with. */
  worksWith: string;
  description: string;
  search: string;
  layout?: SheetLayout;
  icon?: string;
};

export type ShopSection = {
  id: string;
  title: string;
  blurb: string;
  products: ShopProduct[];
};

export const SHOP_SECTIONS: ShopSection[] = [
  {
    id: "labels",
    title: "Buffet label sheets",
    blurb: "Pick the sheet that matches the print format you choose when creating a label sheet.",
    products: [
      {
        name: "Avery 5870",
        detail: '3.5" × 2" · 10 per sheet',
        worksWith: "Standard format",
        description: "The everyday buffet label. Business-card stock, 10 cards to a sheet, that separates after printing.",
        search: "Avery 5870 business cards",
        layout: { kind: "labels", columns: 2, rows: 5, labelWidth: 3.5, labelHeight: 2 },
      },
      {
        name: "Avery 5164",
        detail: '4" × 3⅓" · 6 per sheet',
        worksWith: "Large format",
        description: "A bigger label with room for longer descriptions and allergen notes. Great for upscale events.",
        search: "Avery 5164 labels",
        layout: { kind: "labels", columns: 2, rows: 3, labelWidth: 4, labelHeight: 3.333 },
      },
      {
        name: "Avery 8371",
        detail: '3.5" × 2" · business card size',
        worksWith: "Business Card format",
        description: "Prints one label at a time, perfect for a last-minute addition or a single replacement card.",
        search: "Avery 8371 business cards",
        layout: { kind: "single-card" },
      },
      {
        name: "Avery 95324 tent cards",
        detail: '2" × 3.5" folded · 4 per sheet',
        worksWith: "Tent Card format",
        description: "Scored cards that fold into a tent and stand on their own. Instabels prints the front and an upside-down back so they read from both sides.",
        search: "Avery 95324 tent cards",
        layout: { kind: "labels", columns: 2, rows: 2, labelWidth: 3.5, labelHeight: 4 },
      },
    ],
  },
  {
    id: "menus",
    title: "Plated menu paper",
    blurb: 'Plated menus print two per letter page (8.5" × 11"), ready to cut in half.',
    products: [
      {
        name: "White letter cardstock",
        detail: '8.5" × 11" · 80–110 lb',
        worksWith: "Plated Menu Builder",
        description: "A sturdy, bright white sheet that feels substantial on the table and runs through most home and office printers.",
        search: "white cardstock 8.5 x 11 80 lb",
        layout: { kind: "menu-halves" },
      },
      {
        name: "Linen or felt textured cardstock",
        detail: '8.5" × 11" · textured finish',
        worksWith: "Plated Menu Builder",
        description: "A premium textured finish for weddings and formal dinners. Check your printer supports heavier stock.",
        search: "linen textured cardstock 8.5 x 11",
        layout: { kind: "menu-halves" },
      },
      {
        name: "Paper trimmer",
        detail: "12\" cut length or longer",
        worksWith: "Plated Menu Builder",
        description: "Cut each printed sheet cleanly down the middle. Menus are centered on each half so both come out even.",
        search: "paper trimmer 12 inch",
        icon: "✂️",
      },
    ],
  },
  {
    id: "display",
    title: "Buffet & table display",
    blurb: "Show your labels and menus off on the buffet line and at the table.",
    products: [
      {
        name: "Buffet label holders",
        detail: 'Fits 3.5" × 2" cards',
        worksWith: "Standard & Business Card formats",
        description: "Small stands or clips that hold your labels upright in front of each dish.",
        search: "buffet food label holders 3.5 x 2",
        icon: "🏷️",
      },
      {
        name: "Acrylic menu holders",
        detail: '5.5" × 8.5" · stand-up',
        worksWith: "Plated Menu Builder",
        description: "Clear stands sized for a half-letter menu, so each table's menu stays upright and clean.",
        search: "acrylic sign holder 5.5 x 8.5",
        icon: "🍽️",
      },
    ],
  },
];
