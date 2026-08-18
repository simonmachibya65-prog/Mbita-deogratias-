import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student Portal",
  description: "Access your student dashboard, courses, assignments, and academic resources.",
};

export default function StudentPortalPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy-900 mb-4">Student Portal</h1>
        <p className="text-lg text-navy-600 max-w-2xl mx-auto">
          Access your courses, assignments, grades, and academic resources all in one place.
        </p>
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
        {/* Login Card */}
        <Link
          href="/student-portal/login"
          className="group bg-white border-2 border-border rounded-2xl p-8 hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
              <span className="text-3xl group-hover:text-white transition-colors" aria-hidden="true">🔐</span>
            </div>
            <h2 className="text-2xl font-bold text-navy-900">Login</h2>
          </div>
          <p className="text-navy-600 mb-4">
            Already have an account? Sign in to access your dashboard, courses, and assignments.
          </p>
          <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
            Sign In
            <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Register Card */}
        <Link
          href="/student-portal/register"
          className="group bg-gradient-to-br from-primary to-primary-hover text-white rounded-2xl p-8 hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
              <span className="text-3xl" aria-hidden="true">✨</span>
            </div>
            <h2 className="text-2xl font-bold">Register</h2>
          </div>
          <p className="mb-4 text-white/90">
            New student? Create your account to get started with your academic journey.
          </p>
          <div className="flex items-center font-medium group-hover:gap-2 transition-all">
            Create Account
            <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-navy-900 text-center mb-8">Portal Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "📚", title: "My Courses", desc: "Access all your enrolled courses and materials" },
            { icon: "📝", title: "Assignments", desc: "Submit assignments and track deadlines" },
            { icon: "📊", title: "Grades", desc: "View your grades and academic progress" },
            { icon: "📅", title: "Schedule", desc: "Check your class schedule and office hours" },
            { icon: "💬", title: "Messages", desc: "Communicate with professors and classmates" },
            { icon: "📖", title: "Resources", desc: "Access course materials and learning resources" },
            { icon: "🎯", title: "Achievements", desc: "Track your badges and accomplishments" },
            { icon: "📈", title: "Analytics", desc: "Monitor your learning progress and stats" },
            { icon: "🔔", title: "Notifications", desc: "Stay updated with important announcements" },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-3" aria-hidden="true">{feature.icon}</div>
              <h3 className="font-semibold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-navy-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-navy-50 rounded-2xl p-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-4xl" aria-hidden="true">❓</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-navy-900 mb-2">Need Help?</h3>
            <p className="text-navy-600 mb-4">
              Having trouble logging in or need assistance? We're here to help!
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
              >
                Contact Support
              </Link>
              <a
                href="#faq"
                className="px-5 py-2.5 border-2 border-border text-navy-900 rounded-lg hover:border-primary transition-colors font-medium"
              >
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-navy-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "How do I register for the student portal?",
              a: "Click the 'Register' button above and fill out the registration form with your student information. You'll receive a confirmation email once your account is created."
            },
            {
              q: "I forgot my password. How can I reset it?",
              a: "On the login page, click 'Forgot Password?' and enter your email address. You'll receive a password reset link via email."
            },
            {
              q: "Can I access the portal from my mobile device?",
              a: "Yes! The student portal is fully responsive and works on all devices including smartphones and tablets."
            },
            {
              q: "How do I submit assignments?",
              a: "Once logged in, go to 'My Courses', select your course, and navigate to the assignments section. Click on the assignment and use the upload button to submit your work."
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="bg-white border border-border rounded-xl p-6 group hover:border-primary transition-colors"
            >
              <summary className="font-semibold text-navy-900 cursor-pointer list-none flex items-center justify-between">
                <span>{faq.q}</span>
                <svg className="w-5 h-5 text-navy-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-navy-600 mt-4 text-sm leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
