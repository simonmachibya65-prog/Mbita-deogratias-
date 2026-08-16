import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Research Presentations",
    description: "Slides and recordings from academic presentations and talks.",
    openGraph: { title: "Research Presentations", description: "Academic presentations and talks." },
  };
}

export default async function PresentationsPage() {
  let presentations: Awaited<ReturnType<typeof prisma.researchPresentation.findMany>> = [];
  try {
    presentations = await prisma.researchPresentation.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
    });
  } catch {
    presentations = [];
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/research" className="text-sm text-primary hover:underline mb-4 inline-block">← Back to Research</Link>
        <h1 className="text-4xl font-bold text-navy-900">Research Presentations</h1>
        <p className="text-navy-600 mt-2">Slides and recordings from conferences, seminars, and invited talks.</p>
      </div>

      {presentations.length === 0 ? (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <p className="text-4xl mb-3">🎤</p>
          <p className="text-navy-500">No presentations published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {presentations.map(p => (
            <div key={p.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow flex items-start gap-5">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl" aria-hidden="true">🎤</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-900">{p.title}</h3>
                <p className="text-navy-600 text-sm mt-0.5">{p.event}</p>
                <p className="text-navy-400 text-xs mt-0.5">
                  {new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                {p.description && <p className="text-navy-600 text-sm mt-2">{p.description}</p>}
                <div className="flex gap-3 mt-3">
                  {p.slideUrl && (
                    <a href={p.slideUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                      📊 View Slides
                    </a>
                  )}
                  {p.videoUrl && (
                    <a href={p.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm px-3 py-1.5 border border-border text-navy-700 rounded-lg hover:bg-navy-50 transition-colors">
                      🎬 Watch Recording
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
