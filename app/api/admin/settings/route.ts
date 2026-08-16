import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const settingsSchema = z.object({
  siteTitle: z.string().optional(),
  tagline: z.string().optional(),
  footerText: z.string().optional(),
  contactEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  maintenanceMode: z.boolean().optional(),
  maintenanceMsg: z.string().optional(),
  socialLinks: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  hiddenSections: z.array(z.string()).optional(),
  heroVideoUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroCTAText: z.string().optional(),
  heroCTALink: z.string().optional(),
  showAnnouncements: z.boolean().optional(),
  showStats: z.boolean().optional(),
  showNewsSlider: z.boolean().optional(),
  showUpcomingEvents: z.boolean().optional(),
  showPublications: z.boolean().optional(),
  showTestimonials: z.boolean().optional(),
  showResearchHighlights: z.boolean().optional(),
  showAchievements: z.boolean().optional(),
  showQuickLinks: z.boolean().optional(),
});

async function getUsername(request: NextRequest): Promise<string> {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  return session.username ?? "admin";
}

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      // Return defaults so the admin page can load and save properly
      return NextResponse.json({
        id: 1,
        siteTitle: "",
        tagline: "",
        footerText: "",
        contactEmail: "",
        maintenanceMode: false,
        maintenanceMsg: "",
        socialLinks: [],
        hiddenSections: [],
        heroVideoUrl: "",
        heroImageUrl: "",
        heroTitle: "",
        heroSubtitle: "",
        heroCTAText: "",
        heroCTALink: "",
        showAnnouncements: true,
        showStats: true,
        showNewsSlider: true,
        showUpcomingEvents: true,
        showPublications: true,
        showTestimonials: true,
        showResearchHighlights: true,
        showAchievements: true,
        showQuickLinks: true,
      });
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings.", code: "DB_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const performedBy = await getUsername(request);

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON.", code: "INVALID_JSON" }, { status: 400 });
  }

  const result = settingsSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "unknown";
      fields[field] = issue.message;
    }
    console.error("Settings validation failed:", JSON.stringify(fields, null, 2));
    return NextResponse.json({ error: "Validation failed.", code: "VALIDATION_ERROR", fields }, { status: 400 });
  }

  try {
    // Build update data — only include fields that were actually sent
    const updateData: Record<string, unknown> = {};
    const data = result.data;

    if (data.siteTitle !== undefined) updateData.siteTitle = data.siteTitle;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.footerText !== undefined) updateData.footerText = data.footerText;
    if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
    if (data.maintenanceMode !== undefined) updateData.maintenanceMode = data.maintenanceMode;
    if (data.maintenanceMsg !== undefined) updateData.maintenanceMsg = data.maintenanceMsg;
    if (data.socialLinks !== undefined) updateData.socialLinks = data.socialLinks;
    if (data.hiddenSections !== undefined) updateData.hiddenSections = data.hiddenSections;
    if (data.heroVideoUrl !== undefined) updateData.heroVideoUrl = data.heroVideoUrl;
    if (data.heroImageUrl !== undefined) updateData.heroImageUrl = data.heroImageUrl;
    if (data.heroTitle !== undefined) updateData.heroTitle = data.heroTitle;
    if (data.heroSubtitle !== undefined) updateData.heroSubtitle = data.heroSubtitle;
    if (data.heroCTAText !== undefined) updateData.heroCTAText = data.heroCTAText;
    if (data.heroCTALink !== undefined) updateData.heroCTALink = data.heroCTALink;
    if (data.showAnnouncements !== undefined) updateData.showAnnouncements = data.showAnnouncements;
    if (data.showStats !== undefined) updateData.showStats = data.showStats;
    if (data.showNewsSlider !== undefined) updateData.showNewsSlider = data.showNewsSlider;
    if (data.showUpcomingEvents !== undefined) updateData.showUpcomingEvents = data.showUpcomingEvents;
    if (data.showPublications !== undefined) updateData.showPublications = data.showPublications;
    if (data.showTestimonials !== undefined) updateData.showTestimonials = data.showTestimonials;
    if (data.showResearchHighlights !== undefined) updateData.showResearchHighlights = data.showResearchHighlights;
    if (data.showAchievements !== undefined) updateData.showAchievements = data.showAchievements;
    if (data.showQuickLinks !== undefined) updateData.showQuickLinks = data.showQuickLinks;

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        siteTitle: data.siteTitle || "",
        tagline: data.tagline ?? "",
        footerText: data.footerText ?? "",
        contactEmail: data.contactEmail ?? "",
        socialLinks: data.socialLinks ?? [],
        hiddenSections: data.hiddenSections ?? [],
        maintenanceMode: data.maintenanceMode ?? false,
        maintenanceMsg: data.maintenanceMsg ?? "",
        heroVideoUrl: data.heroVideoUrl ?? "",
        heroImageUrl: data.heroImageUrl ?? "",
        heroTitle: data.heroTitle ?? "",
        heroSubtitle: data.heroSubtitle ?? "",
        heroCTAText: data.heroCTAText ?? "",
        heroCTALink: data.heroCTALink ?? "",
        showAnnouncements: data.showAnnouncements ?? true,
        showStats: data.showStats ?? true,
        showNewsSlider: data.showNewsSlider ?? true,
        showUpcomingEvents: data.showUpcomingEvents ?? true,
        showPublications: data.showPublications ?? true,
        showTestimonials: data.showTestimonials ?? true,
        showResearchHighlights: data.showResearchHighlights ?? true,
        showAchievements: data.showAchievements ?? true,
        showQuickLinks: data.showQuickLinks ?? true,
      },
    });

    revalidatePath("/");
    revalidateTag("settings");
    revalidateTag("home");
    await logAction("UPDATE", "settings", "1", "Site Settings", performedBy);

    return NextResponse.json(settings);
  } catch (err) {
    console.error("Settings save error:", err);
    return NextResponse.json({ error: "Failed to update settings.", code: "DB_ERROR" }, { status: 500 });
  }
}
