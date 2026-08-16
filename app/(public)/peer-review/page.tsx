import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Peer Review System",
  description: "Anonymous peer reviews with rubrics and feedback",
};

export default function PeerReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">✍️ Peer Review System</h1>
          <p className="text-xl text-indigo-100 max-w-3xl">
            Anonymous peer reviews with custom rubrics, feedback templates, and plagiarism detection
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Active Reviews", value: "89", icon: "📝" },
            { label: "Completed", value: "342", icon: "✅" },
            { label: "Avg Score", value: "4.2/5", icon: "⭐" },
            { label: "Response Time", value: "2 days", icon: "⏱️" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Review Submission */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📋 Submit Review</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Assignment</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Research Paper #1</option>
                  <option>Lab Report #2</option>
                  <option>Project Proposal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Overall Score (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 font-bold"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Strengths</label>
                <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="What did they do well?"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Areas for Improvement</label>
                <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="What could be improved?"></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="anonymous" defaultChecked className="w-4 h-4" />
                <label htmlFor="anonymous" className="text-sm text-navy-700">Submit anonymously</label>
              </div>
              <button type="submit" className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                Submit Review
              </button>
            </form>
          </div>

          {/* Rubric Criteria */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📊 Review Rubric</h2>
            <div className="space-y-4">
              {[
                { criteria: "Content Quality", weight: "30%", desc: "Depth and accuracy of content" },
                { criteria: "Organization", weight: "25%", desc: "Structure and flow" },
                { criteria: "Research & Citations", weight: "25%", desc: "Use of sources" },
                { criteria: "Writing Quality", weight: "20%", desc: "Grammar and clarity" },
              ].map((item) => (
                <div key={item.criteria} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-navy-900">{item.criteria}</h3>
                    <span className="text-sm font-bold text-indigo-600">{item.weight}</span>
                  </div>
                  <p className="text-sm text-navy-600">{item.desc}</p>
                  <div className="mt-3 flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        className="w-10 h-10 text-sm border border-gray-300 rounded hover:border-indigo-500 hover:bg-indigo-50"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: "🎭", title: "Anonymous Reviews", desc: "Honest feedback without bias" },
            { icon: "📏", title: "Custom Rubrics", desc: "Define your own evaluation criteria" },
            { icon: "🔍", title: "Plagiarism Check", desc: "Automatic plagiarism detection" },
            { icon: "📝", title: "Feedback Templates", desc: "Pre-written feedback suggestions" },
            { icon: "⭐", title: "Quality Scoring", desc: "Rate the quality of reviews" },
            { icon: "📊", title: "Version Control", desc: "Track revisions and improvements" },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-navy-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Improve Through Peer Feedback</h2>
          <p className="text-lg text-indigo-100 mb-8">Give and receive constructive feedback</p>
          <Link
            href="/student-portal/peer-review"
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Reviewing →
          </Link>
        </div>
      </div>
    </div>
  );
}
