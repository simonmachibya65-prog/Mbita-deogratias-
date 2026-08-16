import AdminLayout from "@/components/layout/AdminLayout";
import { prisma } from "@/lib/prisma";
import { getPhotoForSlot } from "@/lib/profilePhotos";

export const dynamic = "force-dynamic";

async function getProfile() {
  try {
    return await prisma.profile.findFirst({
      select: { fullName: true, title: true, photoUrl: true, email: true, adminPhotoUrl: true },
    });
  } catch {
    return null;
  }
}

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  // Use admin-specific photo slot with fallback to main photo
  const adminPhoto = getPhotoForSlot(profile, "admin");

  return (
    <AdminLayout
      professorName={profile?.fullName ?? "Professor"}
      professorTitle={profile?.title ?? ""}
      professorPhoto={adminPhoto}
      professorEmail={profile?.email ?? ""}
    >
      {children}
    </AdminLayout>
  );
}
