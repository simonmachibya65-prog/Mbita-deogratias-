import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  photoUrl?: string | null;
}

export default function TestimonialCard({ name, role, content, photoUrl }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border flex flex-col gap-4">
      {/* Quote icon */}
      <svg className="w-8 h-8 text-primary opacity-30" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <p className="text-navy-700 leading-relaxed flex-1 italic">&ldquo;{content}&rdquo;</p>
      <div className="flex items-center gap-3 mt-2">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            width={44}
            height={44}
            className="rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
            <span className="text-navy-600 font-semibold text-sm">{name.charAt(0)}</span>
          </div>
        )}
        <div>
          <p className="font-semibold text-navy-900 text-sm">{name}</p>
          <p className="text-navy-500 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}
