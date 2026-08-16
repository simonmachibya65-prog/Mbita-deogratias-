import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Research Assistant",
  description: "AI-powered tools for research and learning",
};

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">🤖 AI Research Assistant</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            AI-powered chatbot, paper summarizer, citation generator, and smart research tools
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* AI Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">💬 Chat with AI</h2>
            <div className="bg-gray-50 rounded-lg p-6 min-h-[400px] mb-4 space-y-4">
              {/* Sample conversation */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-navy-700">Hello! I'm your AI research assistant. How can I help you today?</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow-sm max-w-md">
                  <p>Can you explain quantum entanglement in simple terms?</p>
                </div>
                <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  U
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-navy-700">
                    Quantum entanglement is a phenomenon where two particles become connected...
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                Send
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-navy-900 mb-4">🎯 Quick Actions</h3>
              <div className="space-y-2">
                {[
                  "📄 Summarize Paper",
                  "📚 Generate Citations",
                  "❓ Create Quiz",
                  "✍️ Grammar Check",
                  "🔍 Literature Review",
                ].map((action, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-navy-700"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-navy-900 mb-4">💡 Suggested Topics</h3>
              <div className="flex flex-wrap gap-2">
                {["Math", "Physics", "Statistics", "Research Methods", "Data Analysis"].map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: "📄",
              title: "Paper Summarizer",
              desc: "Upload any research paper and get a concise summary",
            },
            {
              icon: "📚",
              title: "Citation Generator",
              desc: "Generate citations in any format (APA, MLA, Chicago)",
            },
            {
              icon: "❓",
              title: "Quiz Generator",
              desc: "Create quizzes from lecture notes automatically",
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-navy-600 mb-4">{feature.desc}</p>
              <button className="text-blue-600 font-semibold hover:underline">Try Now →</button>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Supercharge Your Research with AI</h2>
          <p className="text-lg text-blue-100 mb-8">Get instant answers and smart research assistance</p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Chatting →
          </button>
        </div>
      </div>
    </div>
  );
}
