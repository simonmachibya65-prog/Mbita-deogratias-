import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual Lab & Research Space",
  description: "Electronic lab notebook and research data management",
};

export default function VirtualLabPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">🧪 Virtual Lab & Research Space</h1>
          <p className="text-xl text-cyan-100 max-w-3xl">
            Electronic lab notebook, data repository, experiment tracking, and collaborative research tools
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Lab Notebooks", value: "45", icon: "📓" },
            { label: "Experiments", value: "128", icon: "🔬" },
            { label: "Datasets", value: "89", icon: "📊" },
            { label: "Equipment", value: "24", icon: "⚗️" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📓 Lab Notebook</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-navy-900">Experiment #42</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Completed</span>
                </div>
                <p className="text-sm text-navy-600 mb-2">Quantum entanglement analysis</p>
                <p className="text-xs text-navy-500">📅 Dec 20, 2024 • 👤 Dr. Mbita</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-navy-900">Experiment #43</h3>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">In Progress</span>
                </div>
                <p className="text-sm text-navy-600 mb-2">Statistical model validation</p>
                <p className="text-xs text-navy-500">📅 Dec 22, 2024 • 👤 Research Team</p>
              </div>
            </div>
            <button className="w-full mt-6 px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700">
              + New Entry
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📊 Data Repository</h2>
            <div className="space-y-4">
              {[
                { name: "Dataset_2024_Q4.csv", size: "12.4 MB", type: "CSV", date: "Dec 20" },
                { name: "Experiment_Results.json", size: "3.2 MB", type: "JSON", date: "Dec 19" },
                { name: "Analysis_Output.xlsx", size: "8.7 MB", type: "Excel", date: "Dec 18" },
              ].map((file, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-2xl">
                    📄
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy-900">{file.name}</h3>
                    <p className="text-xs text-navy-500">{file.size} • {file.type} • {file.date}</p>
                  </div>
                  <button className="text-cyan-600 hover:text-cyan-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Booking */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">⚗️ Equipment Booking</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: "Microscope A", status: "Available", next: "3:00 PM" },
              { name: "Centrifuge B", status: "In Use", next: "5:00 PM" },
              { name: "Spectrometer C", status: "Available", next: "Now" },
              { name: "Computer Lab", status: "Available", next: "Now" },
            ].map((equipment, i) => (
              <div key={i} className="p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-500 transition-colors">
                <h3 className="font-semibold text-navy-900 mb-2">{equipment.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  equipment.status === "Available" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {equipment.status}
                </span>
                <p className="text-sm text-navy-600 mt-2">Next: {equipment.next}</p>
                <button className="w-full mt-3 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg text-sm font-semibold hover:bg-cyan-200">
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: "📝", title: "Electronic Notebook", desc: "Digital lab notebook with version control" },
            { icon: "📊", title: "Data Visualization", desc: "Interactive charts and graphs" },
            { icon: "🔬", title: "Experiment Tracking", desc: "Track methodology and results" },
            { icon: "👥", title: "Team Collaboration", desc: "Share and collaborate in real-time" },
            { icon: "🔐", title: "Secure Storage", desc: "Encrypted data storage" },
            { icon: "📅", title: "Equipment Scheduling", desc: "Book lab equipment online" },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-navy-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Your Virtual Lab</h2>
          <p className="text-lg text-cyan-100 mb-8">Modern research tools for modern science</p>
          <button className="px-8 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-gray-100">
            Create Lab Notebook →
          </button>
        </div>
      </div>
    </div>
  );
}
