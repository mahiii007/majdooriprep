import categoriesData from "@/app/data/categories.json";

export interface CategoryDefinition {
  name: string;
  label: string;
  total: number;
  subCategories: Record<string, number>;
}

export const CATEGORIES = categoriesData as unknown as CategoryDefinition[];

const labelBySlug = new Map(CATEGORIES.map((c) => [c.name, c.label]));

export function getCategoryLabel(slug: string): string {
  return labelBySlug.get(slug) ?? slug;
}

export function formatSubCategoryLabel(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .replace(/\(([^)]+)\)/g, " ($1)")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES.find((c) => c.name === slug);
}
