import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Publication Impact Dashboard",
  description: "Track your research impact in real-time",
};

export default function ImpactDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">📊 Publication Impact Dashboard</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Track citations, h-index, downloads, and research impact with real-time analytics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Citations", value: "2,847", change: "+12%", icon: "📈" },
            { label: "H-Index", value: "34", change: "+2", icon: "🎯" },
            { label: "Publications", value: "89", change: "+5", icon: "📚" },
            { label: "Downloads", value: "12.5K", change: "+18%", icon: "⬇️" },
          ].map((metric, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{metric.icon}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  {metric.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-navy-900">{metric.value}</div>
              <div className="text-sm text-navy-600 mt-1">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">🎯 Features</h2>
            <ul className="space-y-4">
              {[
                "Real-time citation tracking",
                "Google Scholar auto-sync",
                "ORCID integration",
                "Geographic reach analysis",
                "Citation trends over time",
                "Co-author network graphs",
                "Altmetric scores",
                "Impact factor tracking",
                "Download analytics by country",
                "Publication performance comparison",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-navy-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📊 Visualizations</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-6xl mb-2">📈</div>
                <p className="text-navy-600 font-semibold">Citation Trends</p>
                <p className="text-sm text-navy-500">Line charts showing growth</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-6xl mb-2">🌍</div>
                <p className="text-navy-600 font-semibold">Geographic Reach</p>
                <p className="text-sm text-navy-500">World map of downloads</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-6xl mb-2">🔗</div>
                <p className="text-navy-600 font-semibold">Co-author Network</p>
                <p className="text-sm text-navy-500">Interactive network graph</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Tracking Your Research Impact</h2>
          <p className="text-lg text-green-100 mb-8">Connect your Google Scholar and ORCID accounts</p>
          <Link
            href="/admin/integrations"
            className="inline-block px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Connect Accounts →
          </Link>
        </div>
      </div>
    </div>
  );
}
