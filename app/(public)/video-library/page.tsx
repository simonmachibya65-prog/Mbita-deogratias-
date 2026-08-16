import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Video Lecture Library",
  description: "Access recorded lectures with chapters and transcripts",
};

export default function VideoLibraryPage() {
  const videos = [
    { id: 1, title: "Introduction to Calculus", duration: "45:32", views: 1234, course: "MAT301" },
    { id: 2, title: "Linear Algebra Basics", duration: "52:18", views: 987, course: "MAT201" },
    { id: 3, title: "Statistics Fundamentals", duration: "38:45", views: 2156, course: "STAT101" },
    { id: 4, title: "Differential Equations", duration: "1:02:15", views: 876, course: "MAT401" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-pink-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">🎥 Video Lecture Library</h1>
          <p className="text-xl text-red-100 max-w-3xl">
            Access high-quality recorded lectures with searchable transcripts, chapter markers, and progress tracking
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search videos, courses, or topics..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                🔍 Search
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Videos", value: "156", icon: "🎬" },
            { label: "Watch Hours", value: "342", icon: "⏱️" },
            { label: "Courses", value: "12", icon: "📚" },
            { label: "Students", value: "1.2K", icon: "👥" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Video Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">📺 Recent Lectures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/video-library/${video.id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="relative bg-gradient-to-br from-red-400 to-pink-600 aspect-video flex items-center justify-center">
                  <div className="text-white text-6xl group-hover:scale-110 transition-transform">▶️</div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-primary font-semibold mb-1">{video.course}</div>
                  <h3 className="font-semibold text-navy-900 mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-xs text-navy-500">
                    <span>👁️ {video.views} views</span>
                    <span>📅 2 days ago</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">✨ Features</h2>
            <ul className="space-y-3">
              {[
                "HD video streaming",
                "Automatic transcription",
                "Chapter markers",
                "Searchable transcripts",
                "Progress tracking",
                "Playback speed control",
                "Comments with timestamps",
                "Download for offline",
                "Playlist creation",
                "Mobile-friendly player",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-navy-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📖 How to Use</h2>
            <div className="space-y-6">
              {[
                { icon: "🔍", title: "Browse or Search", desc: "Find lectures by course, topic, or keyword" },
                { icon: "▶️", title: "Watch & Learn", desc: "Stream HD videos with chapter navigation" },
                { icon: "📝", title: "Take Notes", desc: "Add comments at specific timestamps" },
                { icon: "✅", title: "Track Progress", desc: "Resume where you left off" },
              ].map((step) => (
                <div key={step.title} className="flex gap-4">
                  <div className="text-3xl flex-shrink-0">{step.icon}</div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{step.title}</h3>
                    <p className="text-sm text-navy-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 to-pink-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Learning Today</h2>
          <p className="text-lg text-red-100 mb-8">Access hundreds of video lectures</p>
          <Link
            href="/student-portal/login"
            className="inline-block px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Library →
          </Link>
        </div>
      </div>
    </div>
  );
}
