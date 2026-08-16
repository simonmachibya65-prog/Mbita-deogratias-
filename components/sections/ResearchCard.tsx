import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { ProjectStatus } from "@prisma/client";
import Image from "next/image";

interface TeamMember {
  name: string;
  photoUrl?: string;
}

interface ResearchCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: ProjectStatus;
  externalUrl?: string | null;
  imageUrl?: string | null;
  githubUrl?: string | null;
  teamMembers?: unknown;
  tags?: unknown;
  startYear?: number;
  endYear?: number | null;
}

export default function ResearchCard({
  slug,
  title,
  description,
  status,
  externalUrl,
  imageUrl,
  githubUrl,
  teamMembers,
  tags,
  startYear,
  endYear,
}: ResearchCardProps) {
  const truncated = description.length > 180 ? description.substring(0, 180) + "..." : description;
  const team = Array.isArray(teamMembers) ? (teamMembers as TeamMember[]).slice(0, 4) : [];
  const tagList = Array.isArray(tags) ? (tags as string[]).slice(0, 3) : [];

  return (
    <article className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Project image */}
      {imageUrl ? (
        <Image src={imageUrl} alt={title} width={600} height={180} className="w-full h-40 object-cover" />
      ) : (
        <div className={`w-full h-24 flex items-center justify-center ${status === "active" ? "bg-gradient-to-br from-primary-light to-navy-100" : "bg-navy-50"}`}>
          <svg className="w-10 h-10 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-navy-900 leading-snug flex-1">
            <Link href={`/research/${slug}`}
              className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              {title}
            </Link>
          </h3>
          <Badge variant={status === "active" ? "active" : "completed"} className="flex-shrink-0">
            {status === "active" ? "Active" : "Completed"}
          </Badge>
        </div>

        {/* Timeline */}
        {startYear && (
          <p className="text-xs text-navy-400 mb-2">
            {startYear}{endYear ? ` – ${endYear}` : " – Present"}
          </p>
        )}

        {/* Tags */}
        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tagList.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full">{tag}</span>
            ))}
          </div>
        )}

        <p className="text-navy-600 text-sm leading-relaxed flex-1">{truncated}</p>

        {/* Team avatars */}
        {team.length > 0 && (
          <div className="flex items-center gap-1 mt-3">
            <span className="text-xs text-navy-400 mr-1">Team:</span>
            {team.map((m, i) => (
              m.photoUrl ? (
                <Image key={i} src={m.photoUrl} alt={m.name} width={24} height={24}
                  className="rounded-full border border-white -ml-1 first:ml-0 object-cover" title={m.name} />
              ) : (
                <div key={i} className="w-6 h-6 rounded-full bg-primary-light border border-white -ml-1 first:ml-0 flex items-center justify-center" title={m.name}>
                  <span className="text-primary text-xs font-bold">{m.name.charAt(0)}</span>
                </div>
              )
            ))}
          </div>
        )}

        {/* Footer links */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
          <Link href={`/research/${slug}`}
            className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
            View Details →
          </Link>
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          )}
          {externalUrl && (
            <a href={externalUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-navy-500 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
              Website ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
