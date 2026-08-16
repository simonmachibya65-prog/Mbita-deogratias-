import Badge from "@/components/ui/Badge";
import { AwardCategory } from "@prisma/client";
import Image from "next/image";

interface AwardCardProps {
  id: string;
  name: string;
  organization: string;
  year: number;
  category: AwardCategory;
  amount?: string | null;
  fundingPeriod?: string | null;
  description?: string | null;
  imageUrl?: string | null;
}

const categoryVariants: Record<AwardCategory, "active" | "archived" | "default"> = {
  award: "active",
  grant: "default",
  fellowship: "default",
  honor: "active",
  distinction: "archived",
};

const categoryIcons: Record<AwardCategory, string> = {
  award: "🏆",
  grant: "💰",
  fellowship: "🎓",
  honor: "⭐",
  distinction: "🎖️",
};

export default function AwardCard({
  name,
  organization,
  year,
  category,
  amount,
  fundingPeriod,
  description,
  imageUrl,
}: AwardCardProps) {
  return (
    <article className="bg-white dark:bg-navy-800 border border-border dark:border-navy-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Award image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${name} award`}
          width={400}
          height={160}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-20 bg-gradient-to-br from-primary-light to-navy-100 dark:from-navy-700 dark:to-navy-800 flex items-center justify-center">
          <span className="text-3xl" aria-hidden="true">{categoryIcons[category]}</span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-navy-900 dark:text-gray-100 leading-snug">{name}</h3>
          <Badge variant={categoryVariants[category]} className="flex-shrink-0 capitalize">
            {category}
          </Badge>
        </div>

        <div className="space-y-1 flex-1">
          <p className="text-sm text-navy-700 dark:text-gray-300 font-medium">{organization}</p>
          <p className="text-sm text-navy-500 dark:text-navy-300">{year}</p>
          {amount && <p className="text-sm text-navy-600 dark:text-navy-300">Amount: {amount}</p>}
          {fundingPeriod && <p className="text-sm text-navy-600 dark:text-navy-300">Period: {fundingPeriod}</p>}
          {description && <p className="text-sm text-navy-600 dark:text-navy-300 mt-2 leading-relaxed">{description}</p>}
        </div>
      </div>
    </article>
  );
}
