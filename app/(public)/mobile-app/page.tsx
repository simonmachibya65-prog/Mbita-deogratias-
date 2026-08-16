import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile App",
  description: "Download our iOS and Android mobile app for on-the-go learning",
};

export default function MobileAppPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">📱 Mobile App</h1>
          <p className="text-xl text-indigo-100 max-w-3xl">
            Learn anywhere, anytime with our native iOS and Android applications
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Download Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Downloads", value: "50K+", icon: "📥" },
            { label: "App Rating", value: "4.9★", icon: "⭐" },
            { label: "Active Users", value: "12K+", icon: "👥" },
            { label: "Countries", value: "45+", icon: "🌍" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900 mb-1">{stat.value}</div>
              <div className="text-sm text-navy-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Download Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900 mb-4">Download Now</h2>
          <p className="text-navy-600 mb-8">Available on iOS and Android devices</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
            {/* App Store Button */}
            <button className="flex items-center space-x-4 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition w-64">
              <div className="text-4xl">🍎</div>
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-xl font-bold">App Store</div>
              </div>
            </button>

            {/* Google Play Button */}
            <button className="flex items-center space-x-4 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition w-64">
              <div className="text-4xl">🤖</div>
              <div className="text-left">
                <div className="text-xs">Get it on</div>
                <div className="text-xl font-bold">Google Play</div>
              </div>
            </button>
          </div>

          <p className="text-sm text-navy-500 mt-6">
            Works on iOS 14+ and Android 8+
          </p>
        </div>

        {/* App Screenshots */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy-900 mb-8 text-center">📸 App Screenshots</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Dashboard", desc: "Your personalized learning hub", icon: "📊" },
              { title: "Course Content", desc: "Video lectures and materials", icon: "🎓" },
              { title: "Offline Mode", desc: "Learn without internet", icon: "📴" },
            ].map((screen) => (
              <div key={screen.title} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-96 bg-gradient-to-b from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-gray-300 rounded-t-3xl">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{screen.icon}</div>
                    <h3 className="font-bold text-navy-900 text-xl">{screen.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-navy-600 text-center">{screen.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy-900 mb-8 text-center">✨ Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📴", title: "Offline Access", desc: "Download courses and learn offline" },
              { icon: "🔔", title: "Push Notifications", desc: "Stay updated with assignments" },
              { icon: "🎥", title: "Video Streaming", desc: "HD quality video lectures" },
              { icon: "📝", title: "Take Notes", desc: "Annotate and highlight content" },
              { icon: "💬", title: "Live Chat", desc: "Message professors and peers" },
              { icon: "🏆", title: "Gamification", desc: "Earn points and badges" },
              { icon: "📊", title: "Progress Tracking", desc: "Monitor your learning journey" },
              { icon: "🌙", title: "Dark Mode", desc: "Easy on the eyes at night" },
              { icon: "⚡", title: "Fast & Smooth", desc: "Native performance" },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-5xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-navy-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* iOS */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center mb-6">
              <div className="text-6xl mr-4">🍎</div>
              <div>
                <h2 className="text-2xl font-bold text-navy-900">iOS App</h2>
                <p className="text-navy-600">For iPhone and iPad</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Version</span>
                <span className="font-semibold text-navy-900">2.5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Size</span>
                <span className="font-semibold text-navy-900">85 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Requirements</span>
                <span className="font-semibold text-navy-900">iOS 14.0+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Language</span>
                <span className="font-semibold text-navy-900">Swift</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Updated</span>
                <span className="font-semibold text-navy-900">Jan 15, 2026</span>
              </div>
            </div>

            <button className="w-full mt-6 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
              Download for iOS
            </button>
          </div>

          {/* Android */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center mb-6">
              <div className="text-6xl mr-4">🤖</div>
              <div>
                <h2 className="text-2xl font-bold text-navy-900">Android App</h2>
                <p className="text-navy-600">For all Android devices</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Version</span>
                <span className="font-semibold text-navy-900">2.4.8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Size</span>
                <span className="font-semibold text-navy-900">72 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Requirements</span>
                <span className="font-semibold text-navy-900">Android 8.0+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Language</span>
                <span className="font-semibold text-navy-900">Kotlin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-600">Updated</span>
                <span className="font-semibold text-navy-900">Jan 12, 2026</span>
              </div>
            </div>

            <button className="w-full mt-6 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
              Download for Android
            </button>
          </div>
        </div>

        {/* User Reviews */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">⭐ User Reviews</h2>
          
          <div className="space-y-6">
            {[
              {
                name: "Sarah M.",
                rating: 5,
                review: "Best educational app I've used! Offline mode is a game-changer.",
                date: "Jan 10, 2026",
              },
              {
                name: "John D.",
                rating: 5,
                review: "Clean interface, smooth performance. Love the push notifications.",
                date: "Jan 8, 2026",
              },
              {
                name: "Emily R.",
                rating: 4,
                review: "Great app overall. Would love to see more customization options.",
                date: "Jan 5, 2026",
              },
            ].map((review) => (
              <div key={review.name} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-navy-900">{review.name}</h3>
                    <div className="text-yellow-500">{"⭐".repeat(review.rating)}</div>
                  </div>
                  <span className="text-sm text-navy-500">{review.date}</span>
                </div>
                <p className="text-navy-600">{review.review}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">❓ Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                q: "Is the app free?",
                a: "Yes! The app is completely free to download and use.",
              },
              {
                q: "Can I access all features offline?",
                a: "Most features work offline after downloading course materials.",
              },
              {
                q: "How much storage does the app need?",
                a: "The app needs 100-200 MB, plus space for downloaded courses.",
              },
              {
                q: "Does it work on tablets?",
                a: "Yes! The app is optimized for both phones and tablets.",
              },
            ].map((faq) => (
              <details key={faq.q} className="p-4 border border-gray-200 rounded-lg cursor-pointer">
                <summary className="font-semibold text-navy-900">{faq.q}</summary>
                <p className="text-navy-600 mt-2">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Learning on Mobile Today</h2>
          <p className="text-lg text-indigo-100 mb-8">Join 50,000+ students learning on the go</p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <button className="px-8 py-3 bg-white text-indigo-700 rounded-lg font-semibold hover:bg-gray-100">
              📥 Download App
            </button>
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 border-2 border-white">
              📧 Email Me the Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
