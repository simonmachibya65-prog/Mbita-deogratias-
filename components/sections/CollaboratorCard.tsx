import Badge from "@/components/ui/Badge";
import { CollaboratorType } from "@prisma/client";
import Image from "next/image";

interface CollaboratorCardProps {
  id: string;
  name: string;
  institution: string;
  area: string;
  type: CollaboratorType;
  profileUrl?: string | null;
  logoUrl?: string | null;
}

export default function CollaboratorCard({ name, institution, area, type, profileUrl, logoUrl }: CollaboratorCardProps) {
  return (
    <article className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        {/* Logo */}
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${name} logo`}
            width={52}
            height={52}
            className="rounded-lg object-contain border border-border bg-white p-1 flex-shrink-0"
          />
        ) : (
          <div className="w-13 h-13 w-[52px] h-[52px] rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-lg">{name.charAt(0)}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-navy-900 truncate">
              {profileUrl ? (
                <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                  className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  {name}
                </a>
              ) : name}
            </h3>
            <Badge variant="default" className="flex-shrink-0 text-xs">
              {type === "individual" ? "Individual" : "Institution"}
            </Badge>
          </div>
          <p className="text-sm text-navy-600 truncate">{institution}</p>
        </div>
      </div>

      <p className="text-sm text-navy-700 flex-1">
        <span className="font-medium">Area:</span> {area}
      </p>

      {profileUrl && (
        <a href={profileUrl} target="_blank" rel="noopener noreferrer"
          className="mt-4 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded inline-flex items-center gap-1">
          View Profile →
        </a>
      )}
    </article>
  );
}
