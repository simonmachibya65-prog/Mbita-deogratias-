import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/activityLog";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Valid photo slot names
const PHOTO_SLOTS = ["main", "navbar", "hero", "about", "contact", "footer", "admin"] as const;
type PhotoSlot = typeof PHOTO_SLOTS[number];

const SLOT_FIELD_MAP: Record<PhotoSlot, string> = {
  main: "photoUrl",
  navbar: "navbarPhotoUrl",
  hero: "heroPhotoUrl",
  about: "aboutPhotoUrl",
  contact: "contactPhotoUrl",
  footer: "footerPhotoUrl",
  admin: "adminPhotoUrl",
};

const SLOT_REVALIDATE_MAP: Record<PhotoSlot, string[]> = {
  main: ["/", "/about", "/contact"],
  navbar: ["/"],
  hero: ["/"],
  about: ["/about"],
  contact: ["/contact"],
  footer: ["/"],
  admin: ["/admin"],
};

const profileSchema = z.object({
  fullName: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  institution: z.string().optional(),
  email: z.string().optional(),
  officeLocation: z.string().optional(),
  officeHours: z.string().optional(),
  bio: z.string().optional(),
  // Photo fields
  photoUrl: z.string().optional(),
  navbarPhotoUrl: z.string().optional(),
  heroPhotoUrl: z.string().optional(),
  aboutPhotoUrl: z.string().optional(),
  contactPhotoUrl: z.string().optional(),
  footerPhotoUrl: z.string().optional(),
  adminPhotoUrl: z.string().optional(),
  cvUrl: z.string().optional(),
  // Text fields — nullable because Prisma returns null for unset optional fields
  vision: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  videoIntroUrl: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  mapEmbedUrl: z.string().nullable().optional(),
  buildingImageUrl: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  // JSON array fields — nullable because Prisma returns null for unset Json fields
  academicProfiles: z.any().optional(),
  skills: z.any().optional(),
  languages: z.any().optional(),
  memberships: z.any().optional(),
  education: z.any().optional(),
  workExperience: z.any().optional(),
  certifications: z.any().optional(),
  faq: z.any().optional(),
  leadershipPositions: z.any().optional(),
  mediaAppearances: z.any().optional(),
  // Read-only fields that frontend sends but we ignore
  id: z.number().optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  autoSyncEnabled: z.boolean().optional(),
  lastSyncAt: z.union([z.string(), z.date(), z.null()]).optional(),
}).passthrough(); // Allow extra fields

async function getSession(request: NextRequest, response: NextResponse) {
  return getIronSession<SessionData>(request, response, sessionOptions);
}

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const response = NextResponse.json({});
  const session = await getSession(request, response);
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const performedBy = session.username;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = profileSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "unknown";
      fields[field] = issue.message;
    }
    console.error("Profile validation failed:", JSON.stringify(fields, null, 2));
    return NextResponse.json({ error: "Validation failed.", fields }, { status: 400 });
  }

  try {
    // Filter out read-only fields and null values from JSON fields for Prisma compatibility
    const { 
      id, updatedAt, autoSyncEnabled, lastSyncAt, // Read-only fields to exclude
      academicProfiles, skills, languages, memberships, education, workExperience, certifications, faq, leadershipPositions, mediaAppearances, 
      ...scalarData 
    } = result.data;
    
    const jsonFields = {
      ...(academicProfiles !== null && academicProfiles !== undefined ? { academicProfiles } : {}),
      ...(skills !== null && skills !== undefined ? { skills } : {}),
      ...(languages !== null && languages !== undefined ? { languages } : {}),
      ...(memberships !== null && memberships !== undefined ? { memberships } : {}),
      ...(education !== null && education !== undefined ? { education } : {}),
      ...(workExperience !== null && workExperience !== undefined ? { workExperience } : {}),
      ...(certifications !== null && certifications !== undefined ? { certifications } : {}),
      ...(faq !== null && faq !== undefined ? { faq } : {}),
      ...(leadershipPositions !== null && leadershipPositions !== undefined ? { leadershipPositions } : {}),
      ...(mediaAppearances !== null && mediaAppearances !== undefined ? { mediaAppearances } : {}),
    };
    const updateData = { ...scalarData, ...jsonFields };
    
    const updated = await prisma.profile.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        fullName: scalarData.fullName ?? "Professor",
        title: scalarData.title ?? "Professor",
        department: scalarData.department ?? "Department",
        institution: scalarData.institution ?? "University",
        email: scalarData.email ?? "professor@university.edu",
        officeLocation: scalarData.officeLocation ?? "Office",
        officeHours: scalarData.officeHours ?? "By appointment",
        bio: scalarData.bio ?? "Biography",
        academicProfiles: academicProfiles ?? [],
        photoUrl: scalarData.photoUrl ?? "",
        navbarPhotoUrl: scalarData.navbarPhotoUrl ?? "",
        heroPhotoUrl: scalarData.heroPhotoUrl ?? "",
        aboutPhotoUrl: scalarData.aboutPhotoUrl ?? "",
        contactPhotoUrl: scalarData.contactPhotoUrl ?? "",
        footerPhotoUrl: scalarData.footerPhotoUrl ?? "",
        adminPhotoUrl: scalarData.adminPhotoUrl ?? "",
        cvUrl: scalarData.cvUrl ?? "",
      },
    });
    revalidatePath("/"); revalidatePath("/about"); revalidatePath("/contact");
    revalidateTag("profile");
    revalidateTag("home");
    await logAction("UPDATE", "profile", "1", updated.fullName, performedBy);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Profile upsert failed:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}

// POST /api/admin/profile — upload photo for a specific slot
// FormData: { photo: File, slot: PhotoSlot }
export async function POST(request: NextRequest) {
  const response = NextResponse.json({});
  const session = await getSession(request, response);
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const performedBy = session.username;

  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    const slot = (formData.get("slot") as string ?? "main") as PhotoSlot;

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP are allowed." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 413 });
    }

    if (!PHOTO_SLOTS.includes(slot)) {
      return NextResponse.json({ error: `Invalid slot. Must be one of: ${PHOTO_SLOTS.join(", ")}` }, { status: 400 });
    }

    // Save file with slot-specific name
    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
    const filename = slot === "main" ? `profile.${ext}` : `profile-${slot}.${ext}`;
    const imagesDir = path.join(process.cwd(), "public", "images");
    await mkdir(imagesDir, { recursive: true });
    const filePath = path.join(imagesDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const photoUrl = `/images/${filename}`;
    const fieldName = SLOT_FIELD_MAP[slot];

    // Update the specific slot field
    await prisma.profile.updateMany({ data: { [fieldName]: photoUrl } });

    // Revalidate relevant pages
    for (const p of SLOT_REVALIDATE_MAP[slot]) revalidatePath(p);
    revalidateTag("profile");
    revalidateTag("home");

    await logAction("UPDATE", "profile", "1", `Photo (${slot})`, performedBy);

    return NextResponse.json({ success: true, photoUrl, slot, field: fieldName });
  } catch (err) {
    console.error("Photo upload failed:", err);
    return NextResponse.json({ error: "Failed to upload photo." }, { status: 500 });
  }
}

// DELETE /api/admin/profile?slot=navbar — clear a specific photo slot
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({});
  const session = await getSession(request, response);
  if (!session.username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const slot = (searchParams.get("slot") ?? "main") as PhotoSlot;

  if (!PHOTO_SLOTS.includes(slot)) {
    return NextResponse.json({ error: "Invalid slot." }, { status: 400 });
  }

  const fieldName = SLOT_FIELD_MAP[slot];
  await prisma.profile.updateMany({ data: { [fieldName]: "" } });
  for (const p of SLOT_REVALIDATE_MAP[slot]) revalidatePath(p);
  revalidateTag("profile");
  revalidateTag("home");

  return NextResponse.json({ success: true, slot, cleared: fieldName });
}
