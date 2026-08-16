import GalleryItem from "@/components/sections/GalleryItem";
import type { GalleryItem as GalleryItemType } from "@prisma/client";

interface GalleryGridProps {
  items: GalleryItemType[];
  onItemClick?: (item: GalleryItemType) => void;
}

export default function GalleryGrid({ items, onItemClick }: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-center text-gray-600 py-12">
        No gallery items available at this time.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item: GalleryItemType) => (
        <GalleryItem
          key={item.id}
          id={item.id}
          imageUrl={item.imageUrl}
          alt={item.alt}
          caption={item.caption}
          category={item.category}
          onClick={onItemClick ? () => onItemClick(item) : undefined}
        />
      ))}
    </div>
  );
}
