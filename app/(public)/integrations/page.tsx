import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integration Hub",
  description: "Connect with Google, Microsoft, Zoom, and more",
};

export default function IntegrationsPage() {
  const integrations = [
    { name: "Google Workspace", icon: "🔵", desc: "Drive, Calendar, Meet", status: "Connected" },
    { name: "Microsoft 365", icon: "🟦", desc: "Teams, OneDrive, Outlook", status: "Available" },
    { name: "Zoom", icon: "🔷", desc: "Video meetings", status: "Connected" },
    { name: "GitHub", icon: "⚫", desc: "Code submissions", status: "Available" },
    { name: "ORCID", icon: "🟢", desc: "Publication sync", status: "Connected" },
    { name: "Slack", icon: "🟣", desc: "Team communication", status: "Available" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">🔌 Integration Hub</h1>
          <p className="text-xl text-fuchsia-100 max-w-3xl">
            Connect with your favorite tools - Google, Microsoft, Zoom, GitHub, and more
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Integrations", value: "15", icon: "🔌" },
            { label: "Connected", value: "6", icon: "✅" },
            { label: "Data Synced", value: "12K", icon: "🔄" },
            { label: "Last Sync", value: "2m ago", icon: "⏱️" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {integrations.map((integration) => (
            <div key={integration.name} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{integration.icon}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  integration.status === "Connected" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {integration.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">{integration.name}</h3>
              <p className="text-sm text-navy-600 mb-4">{integration.desc}</p>
              <button className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                integration.status === "Connected"
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-fuchsia-600 text-white hover:bg-fuchsia-700"
              }`}>
                {integration.status === "Connected" ? "Manage" : "Connect"}
              </button>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">✨ What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Auto-sync Publications", desc: "Keep your publications up-to-date from ORCID and Google Scholar" },
              { title: "Calendar Integration", desc: "Sync appointments with Google Calendar or Outlook" },
              { title: "Video Meetings", desc: "Automatic Zoom links for appointments" },
              { title: "Cloud Storage", desc: "Access files from Google Drive or OneDrive" },
              { title: "Code Submissions", desc: "Students submit code via GitHub" },
              { title: "Team Chat", desc: "Course announcements via Slack or Teams" },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-fuchsia-100 rounded-lg flex items-center justify-center text-fuchsia-600 font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-navy-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Connect Your Tools</h2>
          <p className="text-lg text-fuchsia-100 mb-8">Work where your tools already are</p>
          <button className="px-8 py-3 bg-white text-fuchsia-600 rounded-lg font-semibold hover:bg-gray-100">
            Browse Integrations →
          </button>
        </div>
      </div>
    </div>
  );
}
