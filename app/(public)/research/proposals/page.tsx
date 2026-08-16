import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Research Proposals",
    description: "Grant proposals and research funding applications.",
  };
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function ProposalsPage() {
  let proposals: Awaited<ReturnType<typeof prisma.researchProposal.findMany>> = [];
  try {
    proposals = await prisma.researchProposal.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch { proposals = []; }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/research" className="text-sm text-primary hover:underline mb-4 inline-block">← Back to Research</Link>
      <h1 className="text-4xl font-bold text-navy-900 mb-3">Research Proposals</h1>
      <p className="text-navy-600 mb-8">Grant proposals and funding applications.</p>

      {proposals.length === 0 ? (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-navy-500">No proposals published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(p => (
            <div key={p.id} className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-navy-900 text-lg">{p.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[p.status] ?? STATUS_STYLES.draft}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-navy-600 text-sm mb-3 line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-navy-500">
                    {p.fundingBody && <span>🏛️ {p.fundingBody}</span>}
                    {p.amount && <span>💰 {p.amount}</span>}
                    {p.deadline && <span>📅 Deadline: {new Date(p.deadline).toLocaleDateString()}</span>}
                    {p.submittedAt && <span>✅ Submitted: {new Date(p.submittedAt).toLocaleDateString()}</span>}
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
