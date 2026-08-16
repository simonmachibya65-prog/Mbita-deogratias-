import Badge from "@/components/ui/Badge";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { PublicationType } from "@prisma/client";
import Image from "next/image";
import PublicationCitationExport from "./PublicationCitationExport";

interface PublicationCardProps {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: PublicationType;
  doi?: string | null;
  url?: string | null;
  pdfUrl?: string | null;
  coverImage?: string | null;
}

const typeLabels: Record<PublicationType, string> = {
  journal: "Journal",
  conference: "Conference",
  book: "Book",
  book_chapter: "Book Chapter",
  technical_report: "Technical Report",
  other: "Other",
};

export default function PublicationCard({
  id,
  title,
  authors,
  venue,
  year,
  type,
  doi,
  url,
  pdfUrl,
  coverImage,
}: PublicationCardProps) {
  const externalUrl = doi ? `https://doi.org/${doi}` : url;
  const typeLabel = typeLabels[type] ?? type;

  return (
    <article>
      <Card variant="default" className="h-full flex flex-col hover:shadow-md transition-shadow overflow-hidden">
        {/* Cover image */}
        {coverImage && (
          <div className="w-full h-36 overflow-hidden">
            <Image
              src={coverImage}
              alt={`Cover of ${title}`}
              width={400}
              height={144}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle as="h3" className="text-base font-semibold leading-snug">
              {externalUrl ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  {title}
                </a>
              ) : (
                title
              )}
            </CardTitle>
            <Badge variant="default" className="flex-shrink-0">
              {typeLabel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-1">
          <p className="text-sm text-navy-700 dark:text-gray-300">{authors.join(", ")}</p>
          <p className="text-sm text-navy-600 dark:text-navy-300">
            <span className="italic">{venue}</span>
            {" · "}
            <span className="font-medium">{year}</span>
          </p>
        </CardContent>

        <CardFooter className="flex items-center gap-3 flex-wrap">
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded inline-flex items-center gap-1"
            >
              {doi ? "View DOI" : "View"}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded inline-flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </a>
          )}
          <PublicationCitationExport
            publication={{ id, title, authors, venue, year, type, doi }}
          />
        </CardFooter>
      </Card>
    </article>
  );
}
