import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import Image from "next/image";
import Link from "next/link";
import CollaborationRequestForm from "@/components/sections/CollaborationRequestForm";

export const revalidate = 0;

interface TeamMember {
  name: string;
  role: string;
  photoUrl?: string;
}

interface Milestone {
  title: string;
  date: string;
  completed: boolean;
}

interface Document {
  title: string;
  url: string;
  type?: string;
}

async function getProject(slug: string) {
  try {
    return await prisma.researchProject.findFirst({ where: { slug, published: true } });
  } catch {
    return null;
  }
}

async function renderMarkdown(markdown: string): Promise<string> {
  try {
    const result = await unified()
      .use(remarkParse).use(remarkRehype).use(rehypeSanitize).use(rehypeStringify)
      .process(markdown);
    return String(result);
  } catch {
    return `<p>${markdown}</p>`;
  }
}

export async function generateStaticParams() {
  try {
    const projects = await prisma.researchProject.findMany({ where: { published: true }, select: { slug: true } });
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.title,
    description: project.description.substring(0, 200),
    openGraph: { title: project.title, description: project.description.substring(0, 200) },
  };
}

export default async function ResearchDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  const descriptionHtml = await renderMarkdown(project.description);
  const fundingSources = Array.isArray(project.fundingSources) ? (project.fundingSources as string[]) : [];
  const collaborators = Array.isArray(project.collaborators) ? (project.collaborators as string[]) : [];
  const teamMembers = Array.isArray(project.teamMembers) ? (project.teamMembers as unknown as TeamMember[]) : [];
  const milestones = Array.isArray(project.milestones) ? (project.milestones as unknown as Milestone[]) : [];
  const documents = Array.isArray(project.documents) ? (project.documents as unknown as Document[]) : [];
  const tags = Array.isArray(project.tags) ? (project.tags as string[]) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/research" className="text-sm text-primary hover:underline mb-6 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
        ← Back to Research
      </Link>

      {/* Project image */}
      {project.imageUrl && (
        <div className="mt-4 mb-8 rounded-2xl overflow-hidden shadow-lg">
          <Image src={project.imageUrl} alt={project.title} width={900} height={350} className="w-full h-64 object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">{project.title}</h1>
          <p className="text-navy-500 text-sm">
            {project.startYear}{project.endYear ? ` – ${project.endYear}` : " – Present"}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-primary-light text-primary text-xs rounded-full font-medium">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <Badge variant={project.status === "active" ? "active" : "completed"}>
          {project.status === "active" ? "Active" : "Completed"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <article>
            <div className="prose prose-navy max-w-none text-navy-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </article>

          {/* Team members */}
          {teamMembers.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-4">Research Team</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {teamMembers.map((member, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-4 bg-white border border-border rounded-xl">
                    {member.photoUrl ? (
                      <Image src={member.photoUrl} alt={member.name} width={64} height={64}
                        className="rounded-full object-cover mb-2 border-2 border-border" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-2">
                        <span className="text-primary font-bold text-xl">{member.name.charAt(0)}</span>
                      </div>
                    )}
                    <p className="font-semibold text-navy-900 text-sm">{member.name}</p>
                    <p className="text-navy-500 text-xs">{member.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-4">Project Milestones</h2>
              <div className="relative border-l-2 border-primary-light pl-6 space-y-4">
                {milestones.map((m, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-[1.85rem] w-3.5 h-3.5 rounded-full border-2 border-white shadow ${m.completed ? "bg-green-500" : "bg-navy-300"}`} aria-hidden="true" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`font-medium ${m.completed ? "text-navy-900" : "text-navy-500"}`}>{m.title}</p>
                        <p className="text-xs text-navy-400">{m.date}</p>
                      </div>
                      {m.completed && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex-shrink-0">Done</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-4">Documents &amp; Resources</h2>
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white border border-border rounded-lg hover:shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <span className="text-xl" aria-hidden="true">📄</span>
                    <span className="text-sm font-medium text-navy-900 flex-1">{doc.title}</span>
                    {doc.type && <span className="text-xs text-navy-400 uppercase">{doc.type}</span>}
                    <svg className="w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Collaboration request */}
          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-4">Interested in Collaborating?</h2>
            <CollaborationRequestForm projectTitle={project.title} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Quick actions */}
          <div className="bg-white border border-border rounded-xl p-5 space-y-3">
            {project.externalUrl && (
              <a href={project.externalUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Project Website
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub Repository
              </a>
            )}
          </div>

          {/* Funding */}
          {fundingSources.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-5">
              <h3 className="font-semibold text-navy-900 mb-3">Funding Sources</h3>
              <ul className="space-y-1.5">
                {fundingSources.map((s, i) => (
                  <li key={i} className="text-sm text-navy-700 flex items-start gap-2">
                    <span className="text-primary mt-1 flex-shrink-0" aria-hidden="true">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-5">
              <h3 className="font-semibold text-navy-900 mb-3">Collaborators</h3>
              <ul className="space-y-1.5">
                {collaborators.map((c, i) => (
                  <li key={i} className="text-sm text-navy-700 flex items-start gap-2">
                    <span className="text-primary mt-1 flex-shrink-0" aria-hidden="true">•</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
