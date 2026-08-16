import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import StudentCard from "@/components/sections/StudentCard";
import { separateStudents } from "@/lib/students";

export const revalidate = 0;

async function getStudents() {
  try {
    return await prisma.student.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Students & Supervision",
    description: "Current PhD and Master's students under supervision, and alumni.",
    openGraph: { title: "Students & Supervision", description: "Current students and alumni." },
  };
}

export default async function StudentsPage() {
  const students = await getStudents();
  const { current, alumni } = separateStudents(students);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-navy-900 mb-8">Students &amp; Supervision</h1>

      {/* Current students */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-navy-900 mb-6">
          Current Students
          {current.length > 0 && (
            <span className="ml-2 text-sm font-normal text-navy-500">({current.length})</span>
          )}
        </h2>
        {current.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {current.map((student) => (
              <StudentCard
                key={student.id}
                id={student.id}
                name={student.name}
                degreeLevel={student.degreeLevel}
                researchTopic={student.researchTopic}
                status={student.status}
                profileUrl={student.profileUrl}
                photoUrl={student.photoUrl}
                achievements={student.achievements}
              />
            ))}
          </div>
        ) : (
          <p className="text-navy-600 bg-navy-50 rounded-xl p-6 text-center">
            No current students listed at this time.
          </p>
        )}
      </section>

      {/* Alumni */}
      {alumni.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-navy-900 mb-6">
            Alumni
            <span className="ml-2 text-sm font-normal text-navy-500">({alumni.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((student) => (
              <StudentCard
                key={student.id}
                id={student.id}
                name={student.name}
                degreeLevel={student.degreeLevel}
                researchTopic={student.researchTopic}
                status={student.status}
                thesisTitle={student.thesisTitle}
                graduationYear={student.graduationYear}
                currentPosition={student.currentPosition}
                profileUrl={student.profileUrl}
                photoUrl={student.photoUrl}
                achievements={student.achievements}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
