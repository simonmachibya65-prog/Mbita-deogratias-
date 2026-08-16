import Badge from "@/components/ui/Badge";
import { DegreeLevel, StudentStatus } from "@prisma/client";
import Image from "next/image";

interface StudentCardProps {
  id: string;
  name: string;
  degreeLevel: DegreeLevel;
  researchTopic: string;
  status: StudentStatus;
  thesisTitle?: string | null;
  graduationYear?: number | null;
  currentPosition?: string | null;
  profileUrl?: string | null;
  photoUrl?: string | null;
  achievements?: unknown;
}

export default function StudentCard({
  name,
  degreeLevel,
  researchTopic,
  status,
  thesisTitle,
  graduationYear,
  currentPosition,
  profileUrl,
  photoUrl,
  achievements,
}: StudentCardProps) {
  const achievementList = Array.isArray(achievements) ? (achievements as string[]) : [];

  return (
    <article className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        {/* Photo */}
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            width={56}
            height={56}
            className="rounded-full object-cover flex-shrink-0 border-2 border-border"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 border-2 border-border">
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
            <Badge variant={status === "current" ? "active" : "archived"} className="flex-shrink-0">
              {degreeLevel}
            </Badge>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status === "current" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {status === "current" ? "Current" : "Alumni"}
          </span>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        <p className="text-sm text-navy-700">
          <span className="font-medium">Research:</span> {researchTopic}
        </p>

        {status === "alumni" && (
          <>
            {thesisTitle && (
              <p className="text-sm text-navy-700">
                <span className="font-medium">Thesis:</span> <span className="italic">{thesisTitle}</span>
              </p>
            )}
            {graduationYear && (
              <p className="text-sm text-navy-700">
                <span className="font-medium">Graduated:</span> {graduationYear}
              </p>
            )}
            {currentPosition && (
              <p className="text-sm text-navy-700">
                <span className="font-medium">Now:</span> {currentPosition}
              </p>
            )}
          </>
        )}

        {/* Achievements */}
        {achievementList.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-1">Achievements</p>
            <ul className="space-y-0.5">
              {achievementList.slice(0, 3).map((a, i) => (
                <li key={i} className="text-xs text-navy-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {profileUrl && (
        <a href={profileUrl} target="_blank" rel="noopener noreferrer"
          className="mt-4 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded inline-flex items-center gap-1">
          View Profile →
        </a>
      )}
    </article>
  );
}
