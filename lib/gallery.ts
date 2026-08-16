import type { GalleryItem } from "@prisma/client";

/**
 * Filter gallery items by category.
 * Returns only items whose `category` equals the selected label.
 * If category is empty string or undefined, returns all items.
 */
export function filterByCategory(
  items: GalleryItem[],
  category: string
): GalleryItem[] {
  if (!category) return items;
  return items.filter((item) => item.category === category);
}
