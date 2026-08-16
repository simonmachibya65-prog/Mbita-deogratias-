import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [
    publicationsCount,
    researchCount,
    coursesCount,
    studentsCount,
    awardsCount,
    blogPostsCount,
    eventsCount,
    collaboratorsCount,
    resourcesCount,
    galleryCount,
    unreadMessagesCount,
    recentActivity,
  ] = await Promise.all([
    prisma.publication.count(),
    prisma.researchProject.count(),
    prisma.course.count(),
    prisma.student.count(),
    prisma.award.count(),
    prisma.blogPost.count(),
    prisma.event.count(),
    prisma.collaborator.count(),
    prisma.resource.count(),
    prisma.galleryItem.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.activityLog.findMany({
      orderBy: { performedAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    counts: {
      publications: publicationsCount,
      research: researchCount,
      courses: coursesCount,
      students: studentsCount,
      awards: awardsCount,
      blogPosts: blogPostsCount,
      events: eventsCount,
      collaborators: collaboratorsCount,
      resources: resourcesCount,
      gallery: galleryCount,
      unreadMessages: unreadMessagesCount,
    },
    recentActivity,
  };
}

const countCards: readonly { key: string; label: string; href: string; icon: string; highlight?: boolean }[] = [
  { key: "publications", label: "Publications", href: "/admin/publications", icon: "📄" },
  { key: "research", label: "Research Projects", href: "/admin/research", icon: "🔬" },
  { key: "courses", label: "Courses", href: "/admin/teaching", icon: "🎓" },
  { key: "students", label: "Students", href: "/admin/students", icon: "👩‍🎓" },
  { key: "awards", label: "Awards & Grants", href: "/admin/cv", icon: "🏆" },
  { key: "blogPosts", label: "Blog Posts", href: "/admin/blog", icon: "✍️" },
  { key: "events", label: "Events", href: "/admin/events", icon: "📅" },
  { key: "collaborators", label: "Collaborators", href: "/admin/collaborations", icon: "🤝" },
  { key: "resources", label: "Resources", href: "/admin/collaborations", icon: "📚" },
  { key: "gallery", label: "Gallery Items", href: "/admin/gallery", icon: "🖼️" },
  { key: "unreadMessages", label: "Unread Messages", href: "/admin/messages", icon: "✉️", highlight: true },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminDashboard() {
  const { counts, recentActivity } = await getDashboardData();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of your website content</p>
      </div>

      {/* Count cards */}
      <section aria-labelledby="content-counts-heading">
        <h3 id="content-counts-heading" className="text-lg font-semibold text-navy-800 mb-4">
          Content Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {countCards.map((card) => {
            const count = counts[card.key as keyof typeof counts];
            return (
              <a
                key={card.key}
                href={card.href}
                className={[
                  "block p-4 rounded-lg border transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  card.highlight && count > 0
                    ? "bg-amber-50 border-amber-300 hover:bg-amber-100"
                    : "bg-white border-border hover:bg-navy-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span aria-hidden="true" className="text-xl">{card.icon}</span>
                  <span className="text-sm font-medium text-gray-600">{card.label}</span>
                </div>
                <div className={[
                  "text-3xl font-bold",
                  card.highlight && count > 0 ? "text-amber-700" : "text-navy-900",
                ].join(" ")}>
                  {count}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      <section aria-labelledby="recent-activity-heading">
        <h3 id="recent-activity-heading" className="text-lg font-semibold text-navy-800 mb-4">
          Recent Activity
        </h3>
        {recentActivity.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-6 text-center text-gray-500">
            No activity recorded yet.
          </div>
        ) : (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <ul className="divide-y divide-border">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy-900">
                      <span className="font-medium">{entry.performedBy}</span>
                      {" "}
                      <span className="text-navy-600">{entry.action.toLowerCase()}</span>
                      {" "}
                      {entry.itemTitle && (
                        <span className="font-medium">&ldquo;{entry.itemTitle}&rdquo;</span>
                      )}
                      {" "}
                      <span className="text-gray-500">in {entry.section}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(entry.performedAt)}
                    </p>
                  </div>
                  <span className={[
                    "flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full",
                    entry.action === "CREATE" ? "bg-green-100 text-green-700" :
                    entry.action === "DELETE" ? "bg-red-100 text-red-700" :
                    entry.action === "PUBLISH" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600",
                  ].join(" ")}>
                    {entry.action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
