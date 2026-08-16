import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter System",
  description: "Automated newsletters and email campaigns",
};

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-rose-600 to-pink-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">📧 Newsletter System</h1>
          <p className="text-xl text-rose-100 max-w-3xl">
            Automated newsletters, email campaigns, and subscriber management with analytics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Subscribers", value: "2,450", icon: "👥" },
            { label: "Campaigns Sent", value: "45", icon: "📮" },
            { label: "Open Rate", value: "42%", icon: "📈" },
            { label: "Click Rate", value: "18%", icon: "🖱️" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Campaign Builder */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📝 Create Campaign</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Monthly Research Update"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Subject Line</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Latest research findings..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Template</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Research Update</option>
                  <option>Event Announcement</option>
                  <option>Course Newsletter</option>
                  <option>Blank Template</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Recipients</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>All Subscribers (2,450)</option>
                  <option>Students Only (1,234)</option>
                  <option>Alumni Only (856)</option>
                  <option>Custom Segment</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" className="flex-1 px-6 py-3 border-2 border-rose-600 text-rose-600 rounded-lg font-semibold hover:bg-rose-50">
                  Save Draft
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700">
                  Send Now
                </button>
              </div>
            </form>
          </div>

          {/* Recent Campaigns */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📊 Recent Campaigns</h2>
            <div className="space-y-4">
              {[
                { title: "December Research Update", sent: "Dec 20, 2024", opens: 456, clicks: 89 },
                { title: "Holiday Greetings", sent: "Dec 15, 2024", opens: 512, clicks: 102 },
                { title: "New Course Announcement", sent: "Dec 10, 2024", opens: 398, clicks: 76 },
              ].map((campaign, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <h3 className="font-semibold text-navy-900 mb-2">{campaign.title}</h3>
                  <p className="text-sm text-navy-600 mb-3">📅 {campaign.sent}</p>
                  <div className="flex gap-6 text-sm">
                    <span className="text-navy-700">
                      <strong className="text-rose-600">{campaign.opens}</strong> opens
                    </span>
                    <span className="text-navy-700">
                      <strong className="text-rose-600">{campaign.clicks}</strong> clicks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: "✉️", title: "Email Templates", desc: "Pre-designed professional templates" },
            { icon: "📅", title: "Schedule Sending", desc: "Send at the perfect time" },
            { icon: "📊", title: "Analytics", desc: "Track opens, clicks, and engagement" },
            { icon: "👥", title: "Segmentation", desc: "Target specific groups" },
            { icon: "🤖", title: "Automation", desc: "Set up automated campaigns" },
            { icon: "📱", title: "Mobile Optimized", desc: "Looks great on all devices" },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-navy-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Your Newsletter</h2>
          <p className="text-lg text-rose-100 mb-8">Keep your community informed and engaged</p>
          <button className="px-8 py-3 bg-white text-rose-600 rounded-lg font-semibold hover:bg-gray-100">
            Create Campaign →
          </button>
        </div>
      </div>
    </div>
  );
}
