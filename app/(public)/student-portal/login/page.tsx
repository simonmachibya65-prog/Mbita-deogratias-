import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Login - Mbita Deogratias",
  description: "Login to access your student portal",
};

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-navy-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Student Portal</h1>
          <p className="text-navy-600">Login to access your courses and materials</p>
        </div>

        {/* Login Form */}
        <form action="/api/student/login" method="POST">
          <div className="space-y-5">
            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-navy-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your student ID"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-navy-600">Remember me</span>
              </label>
              <a href="/student-portal/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
            >
              Login to Portal
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-navy-600">
            Don't have an account?{" "}
            <a href="/student-portal/register" className="text-primary font-semibold hover:underline">
              Register here
            </a>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-navy-500 hover:text-navy-700">
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
