import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Research Repository",
    description: "Code repositories, tools, and software from research projects.",
  };
}

export default async function RepositoryPage() {
  let repos: Awaited<ReturnType<typeof prisma.researchRepository.findMany>> = [];
  try {
    repos = await prisma.researchRepository.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch { repos = []; }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/research" className="text-sm text-primary hover:underline mb-4 inline-block">← Back to Research</Link>
      <h1 className="text-4xl font-bold text-navy-900 mb-3">Research Repository</h1>
      <p className="text-navy-600 mb-8">Open-source code, tools, and software from research projects.</p>

      {repos.length === 0 ? (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <p className="text-4xl mb-3">💻</p>
          <p className="text-navy-500">No repositories published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {repos.map(repo => {
            const tags = Array.isArray(repo.tags) ? (repo.tags as string[]) : [];
            return (
              <div key={repo.id} className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-navy-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <h3 className="font-semibold text-navy-900">{repo.title}</h3>
                  </div>
                  {repo.stars > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      ⭐ {repo.stars}
                    </span>
                  )}
                </div>
                <p className="text-navy-600 text-sm mb-3 line-clamp-2">{repo.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {repo.language && (
                    <span className="px-2 py-0.5 bg-navy-100 text-navy-700 text-xs rounded-full">{repo.language}</span>
                  )}
                  {tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex gap-3">
                  {repo.repoUrl && (
                    <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                      View Code
                    </a>
                  )}
                  {repo.demoUrl && (
                    <a href={repo.demoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm px-3 py-1.5 border border-border text-navy-700 rounded-lg hover:bg-navy-50 transition-colors">
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
