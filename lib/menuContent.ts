// Menu data shapes and pure helpers, safe to import from client components.

export type MenuDishEntry = {
  dishId: string | null;
  name: string;
  description: string;
};

export type MenuSectionEntry = {
  sectionId: string | null;
  name: string;
  dishes: MenuDishEntry[];
};

export type MenuContent = {
  sections: MenuSectionEntry[];
};

export type LibrarySection = {
  id: string;
  packageId: string | null;
  name: string;
  sortOrder: number;
  dishes: { id: string; name: string; description: string; sortOrder: number }[];
};

/** A menu type such as "Plated Dinner"; its sections are what that menu can pick from. */
export type LibraryPackage = {
  id: string;
  name: string;
  sortOrder: number;
};

export type Library = {
  packages: LibraryPackage[];
  sections: LibrarySection[];
};

/** Sections a menu of the given package can pick from. */
export function sectionsForPackage(library: Library, packageId: string | null): LibrarySection[] {
  return library.sections.filter((s) => s.packageId === packageId);
}

export function parseMenuContent(value: unknown): MenuContent {
  const raw = (value ?? {}) as { sections?: unknown };
  if (!Array.isArray(raw.sections)) return { sections: [] };

  return {
    sections: raw.sections.map((s) => {
      const section = (s ?? {}) as Record<string, unknown>;
      const dishes = Array.isArray(section.dishes) ? section.dishes : [];
      return {
        sectionId: typeof section.sectionId === "string" ? section.sectionId : null,
        name: typeof section.name === "string" ? section.name : "",
        dishes: dishes.map((d) => {
          const dish = (d ?? {}) as Record<string, unknown>;
          return {
            dishId: typeof dish.dishId === "string" ? dish.dishId : null,
            name: typeof dish.name === "string" ? dish.name : "",
            description: typeof dish.description === "string" ? dish.description : "",
          };
        }),
      };
    }),
  };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-09-28" -> "September 28, 2026" (parsed by hand to avoid timezone shifts). */
export function formatMenuDate(value?: string | null) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}
