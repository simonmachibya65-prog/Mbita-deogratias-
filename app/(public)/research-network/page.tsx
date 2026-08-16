import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Research Collaboration Network",
  description: "Connect with researchers and find collaboration opportunities",
};

export default function ResearchNetworkPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">🤝 Research Collaboration Network</h1>
          <p className="text-xl text-purple-100 max-w-3xl">
            Connect with researchers worldwide, discover collaboration opportunities, and build your research network
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Active Researchers", value: "1,250", icon: "👥" },
            { label: "Collaboration Proposals", value: "342", icon: "📝" },
            { label: "Successful Matches", value: "89", icon: "🎯" },
            { label: "Research Areas", value: "45", icon: "🔬" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">✨ Key Features</h2>
            <ul className="space-y-3">
              {[
                "AI-powered researcher matching",
                "Research interest profiling",
                "Collaboration proposal system",
                "Co-authorship network visualization",
                "Research area discovery",
                "Direct messaging",
                "Project partnership finder",
                "Publication tracking",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-navy-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">🎯 How It Works</h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Create Profile", desc: "Add your research interests and expertise" },
                { step: "2", title: "Get Matched", desc: "AI finds researchers with similar interests" },
                { step: "3", title: "Propose Collaboration", desc: "Send collaboration proposals" },
                { step: "4", title: "Work Together", desc: "Start your research partnership" },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{item.title}</h3>
                    <p className="text-sm text-navy-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Expand Your Research Network?</h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Join our research collaboration network and discover opportunities worldwide
          </p>
          <Link
            href="/research-network/register"
            className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Join Network →
          </Link>
        </div>
      </div>
    </div>
  );
}
