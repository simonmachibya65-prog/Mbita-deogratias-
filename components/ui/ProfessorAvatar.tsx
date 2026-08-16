import Image from "next/image";

interface ProfessorAvatarProps {
  photoUrl?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Reusable circular avatar component for the professor's photo.
 * Renders a Next.js <Image> when photoUrl is set, or a placeholder SVG when null/empty.
 * Always applies rounded-full for circular display.
 */
export default function ProfessorAvatar({
  photoUrl,
  alt,
  width,
  height,
  className = "",
}: ProfessorAvatarProps) {
  const baseClasses = `rounded-full object-cover ${className}`;

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={alt}
        width={width}
        height={height}
        className={baseClasses}
      />
    );
  }

  // Placeholder SVG avatar
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={baseClasses}
      aria-label={alt}
      role="img"
    >
      <circle cx="50" cy="50" r="50" fill="#d9e2ec" />
      {/* Head */}
      <circle cx="50" cy="38" r="18" fill="#829ab1" />
      {/* Body */}
      <ellipse cx="50" cy="80" rx="28" ry="22" fill="#829ab1" />
    </svg>
  );
}
