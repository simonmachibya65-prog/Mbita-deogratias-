import { prisma } from "@/lib/prisma";

/**
 * Log an admin action to the ActivityLog table.
 * Call this after every successful create, update, delete, or publish/unpublish operation.
 */
export async function logAction(
  action: string,
  section: string,
  itemId: string | null,
  itemTitle: string | null,
  performedBy: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        section,
        itemId: itemId ?? undefined,
        itemTitle: itemTitle ?? undefined,
        performedBy,
      },
    });
  } catch (err) {
    // Non-fatal — log to console but don't throw
    console.error("Failed to write activity log:", err);
  }
}
