"use client";

import { useEffect, useRef, useState } from "react";
import MenuSheet from "../app/menus/MenuSheet";
import { DEFAULT_MENU_DESIGN, type MenuDesign } from "@/lib/menuContent";

const dish = (name: string, description: string) => ({ dishId: null, name, description });

const SAMPLE_SECTIONS = [
  { sectionId: null, name: "STARTERS", dishes: [dish("Classic Caesar Salad", "romaine hearts, shaved parmesan, garlic croutons")] },
  {
    sectionId: null,
    name: "ENTREES",
    dishes: [
      dish("Herb Roasted Chicken", "whipped potatoes, seasonal vegetables, pan jus"),
      dish("Grilled Salmon", "wild rice pilaf, asparagus, lemon butter"),
    ],
  },
  { sectionId: null, name: "DESSERT", dishes: [dish("Chocolate Mousse", "whipped cream, fresh berries")] },
];

/** The real plated-menu layout, scaled to fit its container (two menus per letter sheet). */
export default function MenuPreview({ design }: { design?: Partial<MenuDesign> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / (11 * 96)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full overflow-hidden" style={{ aspectRatio: "11 / 8.5" }} aria-label="Example plated dinner menu">
      <div style={{ width: "11in", transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <MenuSheet
          welcomeText="WELCOME"
          hostName="The Smith Wedding"
          dateLabel="June 14, 2027"
          sections={SAMPLE_SECTIONS}
          design={{ ...DEFAULT_MENU_DESIGN, ...design }}
        />
      </div>
    </div>
  );
}
