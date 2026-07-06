export type PrintTemplate = {
  id: string;
  name: string;
  averyProduct: string;
  description: string;
  columns: number;
  rows: number;
  labelWidth: number;   // inches
  labelHeight: number;  // inches
  columnGap: number;    // inches
  rowGap: number;       // inches
  marginTop: number;    // inches (top/bottom page padding)
  marginSide: number;   // inches (left/right page padding)
  labelsPerSheet: number;
};

export const PRINT_TEMPLATES: PrintTemplate[] = [
  {
    id: "5870",
    name: "Standard",
    averyProduct: "Avery 5870",
    description: '3.5" × 2" labels — 10 per sheet. The everyday buffet label.',
    columns: 2,
    rows: 5,
    labelWidth: 3.5,
    labelHeight: 2,
    columnGap: 0,
    rowGap: 0,
    marginTop: 0.5,
    marginSide: 0.75,
    labelsPerSheet: 10,
  },
  {
    id: "5164",
    name: "Large",
    averyProduct: "Avery 5164",
    description: '4" × 3.33" labels — 6 per sheet. Premium size for upscale events.',
    columns: 2,
    rows: 3,
    labelWidth: 4,
    labelHeight: 3.333,
    columnGap: 0,
    rowGap: 0,
    marginTop: 0.5,
    marginSide: 0.25,
    labelsPerSheet: 6,
  },
];

export const DEFAULT_PRINT_TEMPLATE = PRINT_TEMPLATES[0];

export function getPrintTemplate(id: string): PrintTemplate {
  return PRINT_TEMPLATES.find((t) => t.id === id) ?? DEFAULT_PRINT_TEMPLATE;
}