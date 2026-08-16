import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Platform Features - Mbita Deogratias",
  description: "Explore all the features of our academic platform",
};

const features = [
  {
    id: 1,
    name: "Student Portal",
    description: "Complete learning management system with courses, assignments, and grades",
    icon: "🎓",
    color: "bg-blue-500",
    link: "/student-portal/login",
    status: "Active",
  },
  {
    id: 2,
    name: "Research Collaboration Network",
    description: "Connect with researchers worldwide and find collaboration opportunities",
    icon: "🤝",
    color: "bg-purple-500",
    link: "/research-network",
    status: "Active",
  },
  {
    id: 3,
    name: "Publication Impact Dashboard",
    description: "Track citations, h-index, and research impact in real-time",
    icon: "📊",
    color: "bg-green-500",
    link: "/impact-dashboard",
    status: "Active",
  },
  {
    id: 4,
    name: "Course Scheduling",
    description: "Book appointments and manage office hours with intelligent calendar",
    icon: "📅",
    color: "bg-yellow-500",
    link: "/scheduling",
    status: "Active",
  },
  {
    id: 5,
    name: "Video Lecture Library",
    description: "Stream lectures with chapters, transcripts, and progress tracking",
    icon: "🎥",
    color: "bg-red-500",
    link: "/video-library",
    status: "Active",
  },
  {
    id: 6,
    name: "Peer Review System",
    description: "Anonymous peer reviews with rubrics and plagiarism detection",
    icon: "✍️",
    color: "bg-indigo-500",
    link: "/peer-review",
    status: "Active",
  },
  {
    id: 7,
    name: "Alumni Network",
    description: "Stay connected with graduates, job board, and mentorship program",
    icon: "🎓",
    color: "bg-pink-500",
    link: "/alumni",
    status: "Active",
  },
  {
    id: 8,
    name: "Grant Funding Tracker",
    description: "Discover funding opportunities and manage grant applications",
    icon: "💰",
    color: "bg-emerald-500",
    link: "/funding-tracker",
    status: "Active",
  },
  {
    id: 9,
    name: "Virtual Lab",
    description: "Electronic lab notebook, data repository, and experiment tracking",
    icon: "🧪",
    color: "bg-cyan-500",
    link: "/virtual-lab",
    status: "Active",
  },
  {
    id: 10,
    name: "Live Polling & Quizzes",
    description: "Real-time polls, word clouds, and interactive quizzes",
    icon: "📊",
    color: "bg-orange-500",
    link: "/live-polling",
    status: "Active",
  },
  {
    id: 11,
    name: "Gamification",
    description: "Points, badges, leaderboards, and achievement system",
    icon: "🎮",
    color: "bg-violet-500",
    link: "/gamification",
    status: "Active",
  },
  {
    id: 12,
    name: "AI Research Assistant",
    description: "AI-powered chatbot, paper summarizer, and citation generator",
    icon: "🤖",
    color: "bg-blue-600",
    link: "/ai-assistant",
    status: "Active",
  },
  {
    id: 13,
    name: "Digital Certificates",
    description: "Generate certificates with QR verification and blockchain support",
    icon: "🏆",
    color: "bg-amber-500",
    link: "/certificates",
    status: "Active",
  },
  {
    id: 14,
    name: "Resource Marketplace",
    description: "Buy and sell educational resources with secure payments",
    icon: "🛒",
    color: "bg-teal-500",
    link: "/marketplace",
    status: "Active",
  },
  {
    id: 15,
    name: "Multi-Language Support",
    description: "Content in multiple languages with automatic translation",
    icon: "🌍",
    color: "bg-lime-500",
    link: "/settings/language",
    status: "Active",
  },
  {
    id: 16,
    name: "Integration Hub",
    description: "Connect with Google, Microsoft, Zoom, GitHub, and more",
    icon: "🔌",
    color: "bg-fuchsia-500",
    link: "/integrations",
    status: "Active",
  },
  {
    id: 17,
    name: "Newsletter System",
    description: "Automated newsletters with templates and analytics",
    icon: "📧",
    color: "bg-rose-500",
    link: "/newsletter",
    status: "Active",
  },
  {
    id: 18,
    name: "Accessibility",
    description: "Screen reader, high contrast, dyslexia fonts, and more",
    icon: "♿",
    color: "bg-sky-500",
    link: "/accessibility",
    status: "Active",
  },
  {
    id: 19,
    name: "Mobile App",
    description: "Native iOS/Android apps with offline access and push notifications",
    icon: "📱",
    color: "bg-purple-600",
    link: "/mobile-app",
    status: "Active",
  },
  {
    id: 20,
    name: "Advanced Analytics",
    description: "Student engagement, predictive analytics, and A/B testing",
    icon: "📈",
    color: "bg-blue-700",
    link: "/analytics",
    status: "Active",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-navy-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">🚀 All Platform Features</h1>
          <p className="text-xl text-navy-100 max-w-3xl mx-auto">
            Explore our comprehensive academic platform with 20 powerful features designed for modern education
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-3xl font-bold">20</p>
              <p className="text-sm">Features</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-3xl font-bold">114</p>
              <p className="text-sm">Database Models</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm">Free Tier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.link}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 hover:border-primary"
            >
              <div className={`${feature.color} p-6 text-center group-hover:scale-105 transition-transform`}>
                <div className="text-6xl mb-2">{feature.icon}</div>
                <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                  {feature.status}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-primary transition-colors">
                  {feature.name}
                </h3>
                <p className="text-sm text-navy-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center text-primary text-sm font-semibold">
                  Explore →
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-navy-600 mb-8">
            Join thousands of students and researchers using our platform
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/student-portal/register"
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg"
            >
              Register as Student
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
