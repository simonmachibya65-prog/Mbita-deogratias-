import Badge from "@/components/ui/Badge";
import { CourseStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface ScheduleItem {
  day: string;
  time: string;
  room?: string;
}

interface CourseCardProps {
  id: string;
  name: string;
  code: string;
  term: string;
  status: CourseStatus;
  syllabusUrl?: string | null;
  externalUrl?: string | null;
  description?: string | null;
  bannerImage?: string | null;
  zoomUrl?: string | null;
  classroomUrl?: string | null;
  schedule?: unknown;
}

export default function CourseCard({
  id,
  name,
  code,
  term,
  status,
  syllabusUrl,
  externalUrl,
  description,
  bannerImage,
  zoomUrl,
  classroomUrl,
  schedule,
}: CourseCardProps) {
  const scheduleItems = Array.isArray(schedule) ? (schedule as ScheduleItem[]) : [];

  return (
    <article className="bg-white dark:bg-navy-800 border border-border dark:border-navy-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Banner image */}
      {bannerImage ? (
        <Image
          src={bannerImage}
          alt={`${name} banner`}
          width={600}
          height={160}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className={`w-full h-24 flex items-center justify-center ${status === "active" ? "bg-gradient-to-br from-primary-light to-navy-100 dark:from-navy-700 dark:to-navy-800" : "bg-navy-50 dark:bg-navy-700"}`}>
          <svg className="w-10 h-10 text-navy-300 dark:text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-navy-900 dark:text-gray-100 truncate">{name}</h3>
            <p className="text-sm text-navy-500 dark:text-navy-300 mt-0.5">
              <span className="font-mono font-medium">{code}</span> · {term}
            </p>
          </div>
          <Badge variant={status === "active" ? "active" : "archived"} className="flex-shrink-0">
            {status === "active" ? "Active" : "Archived"}
          </Badge>
        </div>

        {description && (
          <p className="text-sm text-navy-600 dark:text-navy-300 leading-relaxed mb-3 line-clamp-2">{description}</p>
        )}

        {/* Schedule */}
        {scheduleItems.length > 0 && (
          <div className="mb-3">
            {scheduleItems.map((s, i) => (
              <p key={i} className="text-xs text-navy-500 dark:text-navy-300 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {s.day} {s.time}{s.room ? ` · ${s.room}` : ""}
              </p>
            ))}
          </div>
        )}

        {/* Action links */}
        <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-border dark:border-navy-700">
          {syllabusUrl && (
            <a href={syllabusUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
              Syllabus
            </a>
          )}
          {externalUrl && (
            <a href={externalUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
              Course Page
            </a>
          )}
          {zoomUrl && (
            <a href={zoomUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              Zoom
            </a>
          )}
          {classroomUrl && (
            <a href={classroomUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500">
              Classroom
            </a>
          )}
          <Link href={`/teaching/${id}`}
            className="text-xs text-navy-500 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded ml-auto">
            Materials →
          </Link>
        </div>
      </div>
    </article>
  );
}
