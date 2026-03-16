export type LabelTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  proOnly: boolean;
  preview: string;

  settings: {
    themeName?: string;

    /* Colors */
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;

    /* Fonts */
    fontFamily?: string;
    foodNameSize?: number;
    dietTextSize?: number;

    /* Layout */
    align?: "left" | "center" | "right";
    padding?: number;
    cardGap?: number;

    /* Borders */
    showBorder?: boolean;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    borderStyle?: "none" | "classic" | "elegant" | "double" | "gold-frame" | "modern";

    /* Decorative Assets */
    backgroundTexture?: string;
    backgroundImage?: string;
    divider?: "none" | "line" | "elegant" | "floral" | "modern";

    /* Logo */
    showLogo?: boolean;
    logoPosition?: "top" | "left" | "right" | "center";
  };
};

export const LABEL_TEMPLATES: LabelTemplate[] = [
  {
    id: "classic-white",
    name: "Classic White",
    description: "Clean and simple buffet card design.",
    category: "Basic",
    proOnly: false,
    preview: "/templates/classic-white.png",

    settings: {
      themeName: "Classic White",

      backgroundColor: "#ffffff",
      textColor: "#111111",
      accentColor: "#444444",

      fontFamily: "Georgia",
      foodNameSize: 28,
      dietTextSize: 12,

      align: "center",

      showBorder: true,
      borderColor: "#d1d5db",
      borderWidth: 1,
      borderRadius: 8,
      borderStyle: "classic",

      divider: "line",
      logoPosition: "top",
    },
  },

  {
    id: "elegant-wedding",
    name: "Elegant Wedding",
    description: "Soft, upscale style perfect for weddings.",
    category: "Wedding",
    proOnly: true,
    preview: "/templates/elegant-wedding.png",

    settings: {
      themeName: "Elegant Wedding",

      backgroundColor: "#fffaf7",
      backgroundTexture: "/textures/paper-cream.jpg",

      textColor: "#3b2f2f",
      accentColor: "#c8a97e",

      fontFamily: "Times New Roman",
      foodNameSize: 30,
      dietTextSize: 12,

      align: "center",

      showBorder: true,
      borderColor: "#dbc7aa",
      borderWidth: 1,
      borderRadius: 10,
      borderStyle: "elegant",

      divider: "elegant",

      logoPosition: "top",
    },
  },

  {
    id: "corporate-buffet",
    name: "Corporate Buffet",
    description: "Professional design for company events.",
    category: "Corporate",
    proOnly: true,
    preview: "/templates/corporate-buffet.png",

    settings: {
      themeName: "Corporate Buffet",

      backgroundColor: "#ffffff",

      textColor: "#0f172a",
      accentColor: "#2563eb",

      fontFamily: "Arial",
      foodNameSize: 28,
      dietTextSize: 12,

      align: "left",

      showBorder: true,
      borderColor: "#93c5fd",
      borderWidth: 1,
      borderRadius: 6,
      borderStyle: "modern",

      divider: "modern",

      logoPosition: "left",
    },
  },

  {
    id: "rustic-farmhouse",
    name: "Rustic Farmhouse",
    description: "Warm rustic buffet labels with wood texture.",
    category: "Rustic",
    proOnly: true,
    preview: "/templates/rustic-farmhouse.png",

    settings: {
      themeName: "Rustic Farmhouse",

      backgroundColor: "#fdf6ec",
      backgroundTexture: "/textures/wood-light.jpg",

      textColor: "#3a2e2a",
      accentColor: "#8b5e3c",

      fontFamily: "Georgia",
      foodNameSize: 28,
      dietTextSize: 12,

      align: "center",

      showBorder: true,
      borderColor: "#c4a484",
      borderWidth: 2,
      borderRadius: 6,
      borderStyle: "classic",

      divider: "line",

      logoPosition: "top",
    },
  },

  {
    id: "holiday-gold",
    name: "Holiday Gold",
    description: "Festive buffet labels for holiday parties.",
    category: "Holiday",
    proOnly: true,
    preview: "/templates/holiday-gold.png",

    settings: {
      themeName: "Holiday Gold",

      backgroundColor: "#fffdf7",

      textColor: "#4b1f1f",
      accentColor: "#d4af37",

      fontFamily: "Times New Roman",
      foodNameSize: 30,
      dietTextSize: 12,

      align: "center",

      showBorder: true,
      borderColor: "#d4af37",
      borderWidth: 2,
      borderRadius: 10,
      borderStyle: "gold-frame",

      divider: "elegant",

      logoPosition: "top",
    },
  },

  {
    id: "minimal-modern",
    name: "Minimal Modern",
    description: "Modern minimal buffet card style.",
    category: "Modern",
    proOnly: false,
    preview: "/templates/minimal-modern.png",

    settings: {
      themeName: "Minimal Modern",

      backgroundColor: "#ffffff",

      textColor: "#111827",
      accentColor: "#6b7280",

      fontFamily: "Helvetica",
      foodNameSize: 26,
      dietTextSize: 12,

      align: "left",

      showBorder: false,

      divider: "modern",

      logoPosition: "left",
    },
  },
];

export const DEFAULT_TEMPLATE_ID = "classic-white";

export const DEFAULT_TEMPLATE =
  LABEL_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID)!;