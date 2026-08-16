import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Polling & Quizzes",
  description: "Real-time polls and interactive quizzes",
};

export default function LivePollingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">📊 Live Polling & Quizzes</h1>
          <p className="text-xl text-orange-100 max-w-3xl">
            Real-time polls, word clouds, interactive quizzes, and instant results for engaging lectures
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Active Poll */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12 border-4 border-orange-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-navy-900">🔴 LIVE: Active Poll</h2>
            <span className="px-4 py-2 bg-red-500 text-white rounded-full font-semibold animate-pulse">
              LIVE
            </span>
          </div>
          <h3 className="text-xl font-semibold text-navy-900 mb-6">
            What is the most challenging topic in this course?
          </h3>
          <div className="space-y-3">
            {[
              { option: "A) Calculus", votes: 45, percentage: 38 },
              { option: "B) Linear Algebra", votes: 32, percentage: 27 },
              { option: "C) Statistics", votes: 28, percentage: 23 },
              { option: "D) Differential Equations", votes: 15, percentage: 12 },
            ].map((opt) => (
              <button
                key={opt.option}
                className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-orange-100 transition-all duration-500"
                  style={{ width: `${opt.percentage}%` }}
                ></div>
                <div className="relative flex items-center justify-between">
                  <span className="font-semibold text-navy-900">{opt.option}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-navy-600">{opt.votes} votes</span>
                    <span className="text-lg font-bold text-orange-600">{opt.percentage}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-navy-500 mt-4">👥 120 participants</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Active Polls", value: "3", icon: "📊" },
            { label: "Total Quizzes", value: "45", icon: "❓" },
            { label: "Participants Today", value: "156", icon: "👥" },
            { label: "Avg Response Time", value: "12s", icon: "⚡" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">❓ Available Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Calculus Basics", questions: 10, time: "15 min", attempts: 234 },
              { title: "Linear Algebra Quiz", questions: 15, time: "20 min", attempts: 189 },
              { title: "Statistics Test", questions: 20, time: "30 min", attempts: 156 },
            ].map((quiz, i) => (
              <div key={i} className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-colors">
                <h3 className="font-bold text-navy-900 mb-3">{quiz.title}</h3>
                <div className="space-y-2 text-sm text-navy-600 mb-4">
                  <p>📝 {quiz.questions} questions</p>
                  <p>⏱️ {quiz.time}</p>
                  <p>👥 {quiz.attempts} attempts</p>
                </div>
                <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: "📊", title: "Live Polls", desc: "Real-time voting with instant results" },
            { icon: "☁️", title: "Word Clouds", desc: "Visual representation of responses" },
            { icon: "❓", title: "Quizzes", desc: "Auto-graded quizzes with feedback" },
            { icon: "⚡", title: "Instant Results", desc: "See results in real-time" },
            { icon: "📈", title: "Analytics", desc: "Track participation and performance" },
            { icon: "🎯", title: "Q&A Sessions", desc: "Interactive question sessions" },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-navy-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Make Learning Interactive</h2>
          <p className="text-lg text-orange-100 mb-8">Engage students with live polls and quizzes</p>
          <button className="px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100">
            Create Poll →
          </button>
        </div>
      </div>
    </div>
  );
}
