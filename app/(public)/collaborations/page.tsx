import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CollaboratorCard from "@/components/sections/CollaboratorCard";
import { validateResourceDescription } from "@/lib/resources";

export const revalidate = 0;

async function getCollaborators() {
  try {
    const collaborators = await prisma.collaborator.findMany({
      where: { published: true },
      orderBy: { name: "asc" },
    });
    return collaborators;
  } catch {
    return [];
  }
}

async function getResources() {
  try {
    const resources = await prisma.resource.findMany({
      where: { published: true },
      orderBy: { title: "asc" },
    });
    return resources;
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Collaborations & Resources",
    description: "Research collaborators, partner institutions, and useful academic resources.",
    openGraph: {
      title: "Collaborations & Resources",
      description: "Academic collaborators and curated research resources.",
    },
  };
}

export default async function CollaborationsPage() {
  const [collaborators, resources] = await Promise.all([
    getCollaborators(),
    getResources(),
  ]);

  const individuals = collaborators.filter((c) => c.type === "individual");
  const institutions = collaborators.filter((c) => c.type === "institution");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-navy-900 mb-8">
        Collaborations &amp; Resources
      </h1>

      {/* Individual collaborators */}
      {individuals.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-navy-900 mb-6">
            Individual Collaborators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {individuals.map((collaborator) => (
              <CollaboratorCard
                key={collaborator.id}
                id={collaborator.id}
                name={collaborator.name}
                institution={collaborator.institution}
                area={collaborator.area}
                type={collaborator.type}
                profileUrl={collaborator.profileUrl}
              />
            ))}
          </div>
        </section>
      )}

      {/* Partner institutions */}
      {institutions.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-navy-900 mb-6">
            Partner Institutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {institutions.map((collaborator) => (
              <CollaboratorCard
                key={collaborator.id}
                id={collaborator.id}
                name={collaborator.name}
                institution={collaborator.institution}
                area={collaborator.area}
                type={collaborator.type}
                profileUrl={collaborator.profileUrl}
              />
            ))}
          </div>
        </section>
      )}

      {collaborators.length === 0 && (
        <p className="text-navy-600 mb-12">No collaborators listed at this time.</p>
      )}

      {/* Resources */}
      <section>
        <h2 className="text-2xl font-semibold text-navy-900 mb-6">Resources</h2>
        {resources.length > 0 ? (
          <ul className="space-y-4">
            {resources.map((resource) => (
              <li key={resource.id} className="border border-border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy-900">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      >
                        {resource.title}
                      </a>
                    </h3>
                    <p className="text-sm text-navy-600 mt-1">
                      {validateResourceDescription(resource.description)}
                    </p>
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    aria-label={`Visit ${resource.title}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-navy-600">No resources listed at this time.</p>
        )}
      </section>
    </div>
  );
}
