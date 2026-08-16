/**
 * Validate and truncate a resource description to a maximum of 150 characters.
 * If the description is already within the limit, it is returned unchanged.
 * If it exceeds 150 characters, it is truncated and "..." is appended.
 */
export function validateResourceDescription(desc: string): string {
  if (desc.length <= 150) {
    return desc;
  }
  return desc.substring(0, 147) + "...";
}
