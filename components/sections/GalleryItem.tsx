import Image from "next/image";

interface GalleryItemProps {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string;
  category: string;
  onClick?: () => void;
}

export default function GalleryItem({
  imageUrl,
  alt,
  caption,
  category,
  onClick,
}: GalleryItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative group w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`View full image: ${alt}`}
    >
      <div className="relative aspect-square">
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Caption overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium leading-snug">{caption}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
            {category}
          </span>
        </div>
      </div>
    </button>
  );
}
