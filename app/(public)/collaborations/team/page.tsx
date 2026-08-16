import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Research Team",
    description: "Meet the research team members and collaborators.",
  };
}

export default async function TeamPage() {
  let members: Awaited<ReturnType<typeof prisma.teamMember.findMany>> = [];
  try {
    members = await prisma.teamMember.findMany({
      where: { published: true },
      orderBy: { joinedYear: "asc" },
    });
  } catch { members = []; }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/collaborations" className="text-sm text-primary hover:underline mb-4 inline-block">← Back to Collaborations</Link>
      <h1 className="text-4xl font-bold text-navy-900 mb-3">Research Team</h1>
      <p className="text-navy-600 mb-10">Meet the team members working on research projects.</p>

      {members.length === 0 ? (
        <div className="text-center py-16 bg-navy-50 rounded-2xl">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-navy-500">No team members listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <div key={member.id} className="bg-white border border-border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              {member.photoUrl ? (
                <Image src={member.photoUrl} alt={member.name} width={80} height={80}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-border" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4 border-2 border-border">
                  <span className="text-primary font-bold text-2xl">{member.name.charAt(0)}</span>
                </div>
              )}
              <h3 className="font-semibold text-navy-900">{member.name}</h3>
              <p className="text-primary text-sm font-medium">{member.role}</p>
              {member.researchArea && <p className="text-navy-500 text-xs mt-1">{member.researchArea}</p>}
              {member.joinedYear && <p className="text-navy-400 text-xs mt-0.5">Since {member.joinedYear}</p>}
              {member.bio && <p className="text-navy-600 text-sm mt-3 line-clamp-3">{member.bio}</p>}
              {member.email && (
                <a href={`mailto:${member.email}`} className="text-xs text-primary hover:underline mt-2 inline-block">
                  {member.email}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
