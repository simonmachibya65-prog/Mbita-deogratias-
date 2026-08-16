import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Research Datasets",
    description: "Open datasets and research data available for download.",
    openGraph: { title: "Research Datasets", description: "Open research datasets." },
  };
}

export default async function DatasetsPage() {
  let datasets: Awaited<ReturnType<typeof prisma.researchDataset.findMany>> = [];
  try {
    datasets = await prisma.researchDataset.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    datasets = [];
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/research" className="text-sm text-primary hover:underline mb-4 inline-block">← Back to Research</Link>
        <h1 className="text-4xl font-bold text-navy-900">Research Datasets</h1>
        <p className="text-navy-600 mt-2">Open datasets and research data available for the academic community.</p>
      </div>

      {datasets.length === 0 ? (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-navy-500">No datasets published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {datasets.map(ds => (
            <div key={ds.id} className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl" aria-hidden="true">📊</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-navy-900">{ds.title}</h3>
                  <p className="text-navy-600 text-sm mt-1 line-clamp-2">{ds.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {ds.format && <span className="px-2 py-0.5 bg-navy-100 text-navy-700 text-xs rounded-full">{ds.format}</span>}
                    {ds.size && <span className="px-2 py-0.5 bg-navy-100 text-navy-700 text-xs rounded-full">{ds.size}</span>}
                  </div>
                  <div className="flex gap-3 mt-4">
                    {ds.url && (
                      <a href={ds.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                        View Dataset →
                      </a>
                    )}
                    {ds.fileUrl && (
                      <a href={ds.fileUrl} download
                        className="text-sm px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
