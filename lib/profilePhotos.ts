// Helper to resolve per-location photos with fallback to main photoUrl

export type PhotoSlot = "navbar" | "hero" | "about" | "contact" | "footer" | "admin";

interface ProfileWithPhotos {
  photoUrl?: string | null;
  navbarPhotoUrl?: string | null;
  heroPhotoUrl?: string | null;
  aboutPhotoUrl?: string | null;
  contactPhotoUrl?: string | null;
  footerPhotoUrl?: string | null;
  adminPhotoUrl?: string | null;
}

/**
 * Returns the photo URL for a specific location.
 * Falls back to the main photoUrl if the slot-specific photo is not set.
 */
export function getPhotoForSlot(profile: ProfileWithPhotos | null | undefined, slot: PhotoSlot): string {
  if (!profile) return "";

  const slotMap: Record<PhotoSlot, string | null | undefined> = {
    navbar: profile.navbarPhotoUrl,
    hero: profile.heroPhotoUrl,
    about: profile.aboutPhotoUrl,
    contact: profile.contactPhotoUrl,
    footer: profile.footerPhotoUrl,
    admin: profile.adminPhotoUrl,
  };

  const slotPhoto = slotMap[slot];
  // Use slot-specific photo if set, otherwise fall back to main photoUrl
  return slotPhoto || profile.photoUrl || "";
}
