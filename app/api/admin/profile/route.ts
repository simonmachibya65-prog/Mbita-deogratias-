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
  fullName: z.string().min(1, "Full name is required"),
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  institution: z.string().min(1, "Institution is required"),
  email: z.string().email("Valid email is required"),
  officeLocation: z.string().min(1, "Office location is required"),
  officeHours: z.string().min(1, "Office hours are required"),
  bio: z.string().min(1, "Bio is required"),
  // Photo fields
  photoUrl: z.string().optional().default(""),
  navbarPhotoUrl: z.string().optional().default(""),
  heroPhotoUrl: z.string().optional().default(""),
  aboutPhotoUrl: z.string().optional().default(""),
  contactPhotoUrl: z.string().optional().default(""),
  footerPhotoUrl: z.string().optional().default(""),
  adminPhotoUrl: z.string().optional().default(""),
  cvUrl: z.string().optional().default(""),
  // Text fields — nullable because Prisma returns null for unset optional fields
  vision: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  videoIntroUrl: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  mapEmbedUrl: z.string().nullable().optional(),
  buildingImageUrl: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  // JSON array fields — nullable because Prisma returns null for unset Json fields
  academicProfiles: z.array(z.object({ label: z.string(), url: z.string() })).nullable().optional().default([]),
  skills: z.array(z.object({ name: z.string(), level: z.number() })).nullable().optional(),
  languages: z.array(z.string()).nullable().optional(),
  memberships: z.array(z.string()).nullable().optional(),
  education: z.array(z.object({ degree: z.string(), institution: z.string(), year: z.string(), logoUrl: z.string().optional() })).nullable().optional(),
  workExperience: z.array(z.object({ role: z.string(), organization: z.string(), period: z.string(), description: z.string().optional() })).nullable().optional(),
  certifications: z.array(z.object({ name: z.string(), issuer: z.string(), year: z.string(), imageUrl: z.string().optional() })).nullable().optional(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).nullable().optional(),
  leadershipPositions: z.array(z.object({ role: z.string(), organization: z.string(), period: z.string(), description: z.string().optional() })).nullable().optional(),
  mediaAppearances: z.array(z.object({ title: z.string(), outlet: z.string(), date: z.string(), url: z.string().optional(), imageUrl: z.string().optional(), type: z.string().optional() })).nullable().optional(),
});

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
  const performedBy = session.username ?? "admin";

  let body: unknown;
  try { 
    body = await request.json(); 
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  // Log received data for debugging
  console.log("Received profile update request:");
  console.log("Keys:", Object.keys(body as object));

  const result = profileSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "unknown";
      fields[field] = issue.message;
    }
    console.error("Profile validation failed:", JSON.stringify(fields, null, 2));
    console.error("Validation errors:", result.error.errors);
    return NextResponse.json({ 
      error: "Validation failed. Please check all required fields.", 
      fields,
      details: result.error.errors.map(e => ({ field: e.path.join("."), message: e.message }))
    }, { status: 400 });
  }

  try {
    // Filter out null values from JSON fields for Prisma compatibility
    const { academicProfiles, skills, languages, memberships, education, workExperience, certifications, faq, leadershipPositions, mediaAppearances, ...scalarData } = result.data;
    
    // Ensure academicProfiles is always an array
    const safeAcademicProfiles = Array.isArray(academicProfiles) ? academicProfiles : [];
    
    const jsonFields = {
      academicProfiles: safeAcademicProfiles,
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
    
    console.log("Attempting to update profile with ID: 1");
    
    const updated = await prisma.profile.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        ...updateData,
        academicProfiles: safeAcademicProfiles,
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
    
    console.log("Profile updated successfully");
    
    revalidatePath("/"); 
    revalidatePath("/about"); 
    revalidatePath("/contact");
    revalidateTag("profile");
    revalidateTag("home");
    
    await logAction("UPDATE", "profile", "1", result.data.fullName, performedBy);
    
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Profile upsert failed - Full error:", err);
    console.error("Error name:", (err as Error).name);
    console.error("Error message:", (err as Error).message);
    console.error("Error stack:", (err as Error).stack);
    
    return NextResponse.json({ 
      error: "Failed to update profile. Please try again or contact support.",
      details: (err as Error).message 
    }, { status: 500 });
  }
}

// POST /api/admin/profile — upload photo for a specific slot
// FormData: { photo: File, slot: PhotoSlot }
export async function POST(request: NextRequest) {
  const response = NextResponse.json({});
  const session = await getSession(request, response);
  const performedBy = session.username ?? "admin";

  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    const slot = (formData.get("slot") as string ?? "main") as PhotoSlot;

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP are allowed." }, { status: 400 });
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
