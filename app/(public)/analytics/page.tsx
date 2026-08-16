import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Analytics",
  description: "Student engagement and predictive analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">📈 Advanced Analytics & Insights</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Student engagement tracking, predictive analytics, performance insights, and A/B testing
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Active Students", value: "1,234", change: "+12%", icon: "👥" },
            { label: "Engagement Score", value: "87%", change: "+5%", icon: "📊" },
            { label: "Completion Rate", value: "92%", change: "+8%", icon: "✅" },
            { label: "Avg Performance", value: "85%", change: "+3%", icon: "📈" },
          ].map((metric, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{metric.icon}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  {metric.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-navy-900 mb-1">{metric.value}</div>
              <div className="text-sm text-navy-600">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Engagement Trend */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📊 Student Engagement Trend</h2>
            <div className="h-64 bg-gradient-to-t from-blue-50 to-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-navy-600 font-semibold">Line Chart</p>
                <p className="text-sm text-navy-500">Engagement over time</p>
              </div>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📊 Performance Distribution</h2>
            <div className="h-64 bg-gradient-to-t from-indigo-50 to-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-navy-600 font-semibold">Bar Chart</p>
                <p className="text-sm text-navy-500">Grade distribution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">🎯 Predictive Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "At-Risk Students", count: 12, risk: "High", color: "red" },
              { title: "Needs Support", count: 34, risk: "Medium", color: "yellow" },
              { title: "On Track", count: 156, risk: "Low", color: "green" },
            ].map((category) => (
              <div key={category.title} className={`p-6 border-2 border-${category.color}-300 bg-${category.color}-50 rounded-xl`}>
                <div className="text-4xl font-bold text-navy-900 mb-2">{category.count}</div>
                <h3 className="font-semibold text-navy-900 mb-1">{category.title}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${category.color}-100 text-${category.color}-700`}>
                  {category.risk} Risk
                </span>
                <button className="w-full mt-4 px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">🔥 Most Active Courses</h2>
            <div className="space-y-4">
              {[
                { course: "Advanced Mathematics", students: 234, engagement: 92 },
                { course: "Statistics 101", students: 189, engagement: 88 },
                { course: "Linear Algebra", students: 156, engagement: 85 },
              ].map((course) => (
                <div key={course.course} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-navy-900">{course.course}</h3>
                    <p className="text-sm text-navy-600">👥 {course.students} students</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{course.engagement}%</div>
                    <div className="text-xs text-navy-500">Engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">🎯 A/B Test Results</h2>
            <div className="space-y-4">
              {[
                { test: "Email Subject Line", winner: "Variant A", improvement: "+15%" },
                { test: "Assignment Format", winner: "Variant B", improvement: "+8%" },
                { test: "Quiz Timing", winner: "Variant A", improvement: "+12%" },
              ].map((test) => (
                <div key={test.test} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-navy-900 mb-2">{test.test}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-navy-600">Winner: <strong>{test.winner}</strong></span>
                    <span className="text-sm font-bold text-green-600">{test.improvement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: "📊", title: "Real-time Dashboards", desc: "Live data visualization" },
            { icon: "🎯", title: "Predictive Models", desc: "AI-powered predictions" },
            { icon: "📈", title: "Trend Analysis", desc: "Identify patterns and trends" },
            { icon: "🧪", title: "A/B Testing", desc: "Optimize everything" },
            { icon: "📥", title: "Export Reports", desc: "PDF and Excel exports" },
            { icon: "🔔", title: "Smart Alerts", desc: "Automated notifications" },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-navy-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Make Data-Driven Decisions</h2>
          <p className="text-lg text-blue-100 mb-8">Powerful insights at your fingertips</p>
          <button className="px-8 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-gray-100">
            View Full Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
