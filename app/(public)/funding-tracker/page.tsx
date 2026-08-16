import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grant Funding Tracker",
  description: "Discover funding opportunities and manage applications",
};

export default function FundingTrackerPage() {
  const opportunities = [
    { title: "NSF Research Grant", amount: "$500,000", deadline: "Jan 15, 2025", status: "Open" },
    { title: "NIH Early Career Award", amount: "$250,000", deadline: "Feb 1, 2025", status: "Open" },
    { title: "DOE Science Grant", amount: "$750,000", deadline: "Dec 30, 2024", status: "Closing Soon" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">💰 Grant Funding Tracker</h1>
          <p className="text-xl text-emerald-100 max-w-3xl">
            Discover funding opportunities, track applications, and manage grant deadlines
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Active Opportunities", value: "156", icon: "🎯" },
            { label: "Your Applications", value: "8", icon: "📝" },
            { label: "Success Rate", value: "32%", icon: "📊" },
            { label: "Total Awarded", value: "$1.2M", icon: "💰" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Funding Opportunities */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">🔍 Latest Opportunities</h2>
          <div className="space-y-4">
            {opportunities.map((opp, i) => (
              <div key={i} className="p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-navy-900">{opp.title}</h3>
                    <p className="text-emerald-600 font-semibold text-lg mt-1">{opp.amount}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    opp.status === "Closing Soon" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {opp.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-navy-600 mb-4">
                  <span>📅 Deadline: {opp.deadline}</span>
                  <span>🏛️ Federal Funding</span>
                  <span>🔬 Research Area: Science</span>
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">
                    Apply Now
                  </button>
                  <button className="px-6 py-2 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50">
                    Save for Later
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: "🔔", title: "Smart Alerts", desc: "Get notified of matching opportunities" },
            { icon: "📊", title: "Application Tracker", desc: "Manage all your applications" },
            { icon: "💰", title: "Budget Calculator", desc: "Plan your grant budget" },
            { icon: "📅", title: "Deadline Calendar", desc: "Never miss a deadline" },
            { icon: "👥", title: "Team Builder", desc: "Find co-investigators" },
            { icon: "📈", title: "Success Analytics", desc: "Track your success rate" },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-navy-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Finding Funding Today</h2>
          <p className="text-lg text-emerald-100 mb-8">Never miss a funding opportunity again</p>
          <button className="px-8 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-gray-100">
            Browse Opportunities →
          </button>
        </div>
      </div>
    </div>
  );
}
