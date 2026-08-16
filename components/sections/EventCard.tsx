import Image from "next/image";

interface EventCardProps {
  id: string;
  name: string;
  date: Date | string;
  location: string;
  description: string;
  externalUrl?: string | null;
  posterImage?: string | null;
  registrationUrl?: string | null;
  streamUrl?: string | null;
}

export default function EventCard({
  name,
  date,
  location,
  description,
  externalUrl,
  posterImage,
  registrationUrl,
  streamUrl,
}: EventCardProps) {
  const eventDate = new Date(date);
  const isUpcoming = eventDate >= new Date();

  return (
    <article className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Poster image */}
      {posterImage ? (
        <Image
          src={posterImage}
          alt={`Poster for ${name}`}
          width={600}
          height={240}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className={`w-full h-44 flex items-center justify-center ${isUpcoming ? "bg-gradient-to-br from-primary-light to-navy-100" : "bg-navy-50"}`}>
          <svg className="w-12 h-12 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Status badge */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 w-fit ${isUpcoming ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
          {isUpcoming ? "Upcoming" : "Past"}
        </span>

        <h3 className="text-base font-semibold text-navy-900 mb-2 line-clamp-2">{name}</h3>

        <div className="space-y-1.5 mb-3">
          <p className="text-sm text-navy-600 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time dateTime={eventDate.toISOString()}>
              {eventDate.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </time>
          </p>
          <p className="text-sm text-navy-600 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {location}
          </p>
        </div>

        <p className="text-sm text-navy-600 leading-relaxed flex-1 line-clamp-3">{description}</p>

        {/* Action links */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border">
          {externalUrl && (
            <a href={externalUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              Details →
            </a>
          )}
          {registrationUrl && isUpcoming && (
            <a href={registrationUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Register
            </a>
          )}
          {streamUrl && (
            <a href={streamUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Live Stream
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
