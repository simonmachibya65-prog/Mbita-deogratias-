import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Alumni Network",
  description: "Connect with graduates and access mentorship opportunities",
};

export default function AlumniPage() {
  const alumni = [
    { name: "Sarah Johnson", year: 2020, position: "Data Scientist at Google", photo: "SJ" },
    { name: "Michael Chen", year: 2019, position: "Research Fellow at MIT", photo: "MC" },
    { name: "Amina Hassan", year: 2021, position: "Professor at Oxford", photo: "AH" },
    { name: "David Kim", year: 2018, position: "CEO, MathTech Inc", photo: "DK" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pink-600 to-rose-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">🎓 Alumni Network</h1>
          <p className="text-xl text-pink-100 max-w-3xl">
            Stay connected with graduates, find mentors, and discover job opportunities
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Alumni", value: "2,450", icon: "👥" },
            { label: "Mentors Available", value: "145", icon: "🤝" },
            { label: "Job Postings", value: "89", icon: "💼" },
            { label: "Success Stories", value: "234", icon: "⭐" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Alumni */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">🌟 Featured Alumni</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {alumni.map((person) => (
              <div key={person.name} className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-xl transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {person.photo}
                </div>
                <h3 className="font-bold text-navy-900 mb-1">{person.name}</h3>
                <p className="text-xs text-primary mb-2">Class of {person.year}</p>
                <p className="text-sm text-navy-600">{person.position}</p>
                <button className="mt-4 w-full px-4 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-semibold hover:bg-pink-200 transition-colors">
                  Request Mentorship
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-navy-900 mb-3">Job Board</h3>
            <p className="text-navy-600 mb-4">
              Access exclusive job postings from alumni companies and organizations worldwide
            </p>
            <Link href="/alumni/jobs" className="text-pink-600 font-semibold hover:underline">
              Browse Jobs →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-navy-900 mb-3">Mentorship Program</h3>
            <p className="text-navy-600 mb-4">
              Connect with experienced alumni mentors for career guidance and advice
            </p>
            <Link href="/alumni/mentorship" className="text-pink-600 font-semibold hover:underline">
              Find Mentor →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-navy-900 mb-3">Success Stories</h3>
            <p className="text-navy-600 mb-4">
              Read inspiring stories from alumni making an impact around the world
            </p>
            <Link href="/alumni/stories" className="text-pink-600 font-semibold hover:underline">
              Read Stories →
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join the Alumni Network</h2>
          <p className="text-lg text-pink-100 mb-8">Stay connected and give back to the community</p>
          <Link
            href="/alumni/register"
            className="inline-block px-8 py-3 bg-white text-pink-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Register as Alumni →
          </Link>
        </div>
      </div>
    </div>
  );
}
