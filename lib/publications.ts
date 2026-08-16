// Minimal publication type compatible with Prisma's Publication model
interface PublicationLike {
  id: string;
  title: string;
  authors: unknown;
  venue: string;
  year: number;
  type: string;
  doi?: string | null;
  url?: string | null;
  abstract?: string | null;
  published: boolean;
}

/**
 * Filter publications by type.
 * Returns only publications whose `type` equals the selected value.
 * If type is empty string or undefined, returns all publications.
 */
export function filterByType<T extends PublicationLike>(
  publications: T[],
  type: string
): T[] {
  if (!type) return publications;
  return publications.filter((p) => p.type === type);
}

/**
 * Search publications by keyword (case-insensitive).
 * Returns publications whose title or any entry in authors contains the keyword.
 * If keyword is empty string, returns all publications.
 */
export function searchByKeyword<T extends PublicationLike>(
  publications: T[],
  keyword: string
): T[] {
  if (!keyword.trim()) return publications;
  const lower = keyword.toLowerCase();
  return publications.filter((p) => {
    const titleMatch = p.title.toLowerCase().includes(lower);
    const authors = Array.isArray(p.authors) ? (p.authors as string[]) : [];
    const authorMatch = authors.some(
      (a) => typeof a === "string" && a.toLowerCase().includes(lower)
    );
    return titleMatch || authorMatch;
  });
}
