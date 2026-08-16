import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 0;

async function getCourse(id: string) {
  try {
    return await prisma.course.findFirst({ where: { id, published: true } });
  } catch {
    return null;
  }
}

async function getMaterials(courseId: string) {
  try {
    return await prisma.courseMaterial.findMany({
      where: { courseId, published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const courses = await prisma.course.findMany({ where: { published: true }, select: { id: true } });
    return courses.map((c) => ({ id: c.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const course = await getCourse(params.id);
  if (!course) return { title: "Course Not Found" };
  return {
    title: `${course.name} (${course.code})`,
    description: course.description ?? `Course materials for ${course.name}`,
    openGraph: { title: course.name, description: course.description ?? "" },
  };
}

const typeIcons: Record<string, string> = {
  lecture_note: "📄",
  video: "🎬",
  assignment: "📝",
  quiz: "❓",
  other: "📎",
};

const typeLabels: Record<string, string> = {
  lecture_note: "Lecture Note",
  video: "Video Lecture",
  assignment: "Assignment",
  quiz: "Quiz / Exam",
  other: "Resource",
};

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = await getCourse(params.id);
  if (!course) notFound();

  const materials = await getMaterials(course.id);

  // Group materials by type
  const grouped = materials.reduce<Record<string, typeof materials>>((acc, m) => {
    if (!acc[m.type]) acc[m.type] = [];
    acc[m.type].push(m);
    return acc;
  }, {});

  const schedule = Array.isArray(course.schedule)
    ? (course.schedule as Array<{ day: string; time: string; room?: string }>)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link href="/teaching" className="text-sm text-primary hover:underline mb-6 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
        ← Back to Teaching
      </Link>

      {/* Banner */}
      {course.bannerImage && (
        <div className="mt-4 mb-8 rounded-2xl overflow-hidden shadow-lg">
          <Image src={course.bannerImage} alt={course.name} width={900} height={300} className="w-full h-56 object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">{course.name}</h1>
          <p className="text-navy-600 mt-1">
            <span className="font-mono font-semibold">{course.code}</span> · {course.term}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${course.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
          {course.status === "active" ? "Active" : "Archived"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {course.description && (
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">About This Course</h2>
              <p className="text-navy-700 leading-relaxed">{course.description}</p>
            </section>
          )}

          {/* Materials by type */}
          {Object.keys(grouped).length > 0 ? (
            Object.entries(grouped).map(([type, items]) => (
              <section key={type}>
                <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <span aria-hidden="true">{typeIcons[type] ?? "📎"}</span>
                  {typeLabels[type] ?? type}
                  <span className="text-sm font-normal text-navy-500">({items.length})</span>
                </h2>
                <div className="space-y-3">
                  {items.map((material) => (
                    <div key={material.id} className="flex items-center gap-4 p-4 bg-white border border-border rounded-xl hover:shadow-sm transition-shadow">
                      <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg" aria-hidden="true">{typeIcons[material.type] ?? "📎"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-navy-900 truncate">{material.title}</p>
                        {material.content && (
                          <p className="text-sm text-navy-500 line-clamp-1">{material.content}</p>
                        )}
                      </div>
                      {material.url && (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {material.type === "video" ? "Watch" : "Download"}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-12 bg-navy-50 rounded-xl">
              <p className="text-navy-500">No materials uploaded yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Schedule */}
          {schedule.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-5">
              <h3 className="font-semibold text-navy-900 mb-3">Schedule</h3>
              <div className="space-y-2">
                {schedule.map((s, i) => (
                  <div key={i} className="text-sm text-navy-700">
                    <span className="font-medium">{s.day}</span> · {s.time}
                    {s.room && <span className="text-navy-500"> · {s.room}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="font-semibold text-navy-900 mb-3">Quick Links</h3>
            <div className="space-y-2">
              {course.syllabusUrl && (
                <a href={course.syllabusUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  📋 Syllabus
                </a>
              )}
              {course.zoomUrl && (
                <a href={course.zoomUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  🎥 Join Zoom
                </a>
              )}
              {course.classroomUrl && (
                <a href={course.classroomUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  🏫 Google Classroom
                </a>
              )}
              {course.externalUrl && (
                <a href={course.externalUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  🔗 Course Page
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-navy-50 rounded-xl p-5">
            <h3 className="font-semibold text-navy-900 mb-3">Materials Summary</h3>
            <div className="space-y-1.5">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-navy-600">{typeLabels[type] ?? type}</span>
                  <span className="font-semibold text-navy-900">{items.length}</span>
                </div>
              ))}
              {materials.length === 0 && <p className="text-sm text-navy-500">No materials yet</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
