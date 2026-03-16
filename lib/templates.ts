export type LabelTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  proOnly: boolean;
  preview: string;
  settings: {
    themeName?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontFamily?: string;
    foodNameSize?: number;
    dietTextSize?: number;
    align?: "left" | "center" | "right";
    logoPosition?: "top" | "left" | "right" | "none";
    showBorder?: boolean;
    showLogo?: boolean;
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
      accentColor: "#222222",
      borderColor: "#d1d5db",
      borderWidth: 1,
      borderRadius: 8,
      fontFamily: "Georgia",
      foodNameSize: 28,
      dietTextSize: 12,
      align: "center",
      logoPosition: "top",
      showBorder: true,
      showLogo: true,
    },
  },
  {
    id: "elegant-wedding",
    name: "Elegant Wedding",
    description: "Soft, upscale style for weddings and formal events.",
    category: "Wedding",
    proOnly: true,
    preview: "/templates/elegant-wedding.png",
    settings: {
      themeName: "Elegant Wedding",
      backgroundColor: "#fffaf7",
      textColor: "#3b2f2f",
      accentColor: "#c8a97e",
      borderColor: "#dbc7aa",
      borderWidth: 1,
      borderRadius: 10,
      fontFamily: "Times New Roman",
      foodNameSize: 30,
      dietTextSize: 12,
      align: "center",
      logoPosition: "top",
      showBorder: true,
      showLogo: true,
    },
  },
  {
    id: "corporate-buffet",
    name: "Corporate Buffet",
    description: "Professional and clean style for company events.",
    category: "Corporate",
    proOnly: true,
    preview: "/templates/corporate-buffet.png",
    settings: {
      themeName: "Corporate Buffet",
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
      accentColor: "#2563eb",
      borderColor: "#93c5fd",
      borderWidth: 1,
      borderRadius: 6,
      fontFamily: "Arial",
      foodNameSize: 28,
      dietTextSize: 12,
      align: "left",
      logoPosition: "left",
      showBorder: true,
      showLogo: true,
    },
  },
];