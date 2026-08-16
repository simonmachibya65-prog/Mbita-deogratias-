/**
 * Validate and truncate a blog post excerpt to a maximum of 200 characters.
 * If the excerpt is already within the limit, it is returned unchanged.
 * If it exceeds 200 characters, it is truncated and "..." is appended.
 */
export function validateExcerpt(excerpt: string): string {
  if (excerpt.length <= 200) {
    return excerpt;
  }
  return excerpt.substring(0, 197) + "...";
}
