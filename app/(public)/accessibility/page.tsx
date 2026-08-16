import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Settings",
  description: "Customize your accessibility preferences for a better experience",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-700 to-pink-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">♿ Accessibility Settings</h1>
          <p className="text-xl text-purple-100 max-w-3xl">
            Customize your experience with WCAG 2.1 compliant accessibility features
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "WCAG Level", value: "AAA", icon: "✅" },
            { label: "Screen Reader", value: "100%", icon: "🗣️" },
            { label: "Keyboard Nav", value: "Full", icon: "⌨️" },
            { label: "Color Contrast", value: "7:1", icon: "🎨" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-navy-900 mb-1">{stat.value}</div>
              <div className="text-sm text-navy-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Visual Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">👁️ Visual Preferences</h2>
          
          <div className="space-y-6">
            {/* High Contrast Mode */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">High Contrast Mode</h3>
                <p className="text-sm text-navy-600">Increase contrast for better visibility</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Font Size */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-navy-900 mb-3">Font Size</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-navy-600 w-20">Small</span>
                <input 
                  type="range" 
                  min="12" 
                  max="24" 
                  defaultValue="16" 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-navy-600 w-20 text-right">Large</span>
              </div>
              <p className="text-xs text-navy-500 mt-2">Current: 16px</p>
            </div>

            {/* Color Theme */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-navy-900 mb-3">Color Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Light", colors: ["bg-white", "bg-gray-100", "bg-gray-200"] },
                  { name: "Dark", colors: ["bg-gray-900", "bg-gray-800", "bg-gray-700"] },
                  { name: "High Contrast", colors: ["bg-black", "bg-yellow-400", "bg-white"] },
                ].map((theme) => (
                  <button
                    key={theme.name}
                    className="p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 transition"
                  >
                    <div className="flex space-x-1 mb-2">
                      {theme.colors.map((color, i) => (
                        <div key={i} className={`h-8 w-full ${color} rounded`}></div>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-navy-900">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Reduce Motion */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">Reduce Motion</h3>
                <p className="text-sm text-navy-600">Minimize animations and transitions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Dyslexia Font */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">Dyslexia-Friendly Font</h3>
                <p className="text-sm text-navy-600">Use OpenDyslexic font for easier reading</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Screen Reader */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">🗣️ Screen Reader Support</h2>
          
          <div className="space-y-6">
            {/* Screen Reader Mode */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">Enhanced Screen Reader Mode</h3>
                <p className="text-sm text-navy-600">Optimized for JAWS, NVDA, and VoiceOver</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Skip Links */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">Show Skip Links</h3>
                <p className="text-sm text-navy-600">Jump to main content, navigation, footer</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* ARIA Descriptions */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">Detailed ARIA Descriptions</h3>
                <p className="text-sm text-navy-600">More verbose element descriptions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Keyboard Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">⌨️ Keyboard Navigation</h2>
          
          <div className="space-y-6">
            {/* Focus Indicators */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">Enhanced Focus Indicators</h3>
                <p className="text-sm text-navy-600">Thick, high-contrast focus outlines</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-navy-900 mb-3">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "Tab", action: "Navigate forward" },
                  { key: "Shift + Tab", action: "Navigate backward" },
                  { key: "Enter", action: "Activate element" },
                  { key: "Space", action: "Toggle/Select" },
                  { key: "Esc", action: "Close modal/menu" },
                  { key: "Arrow Keys", action: "Navigate menu items" },
                ].map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between text-sm">
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                      {shortcut.key}
                    </kbd>
                    <span className="text-navy-600">{shortcut.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">📝 Content Preferences</h2>
          
          <div className="space-y-6">
            {/* Captions */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">Automatic Captions</h3>
                <p className="text-sm text-navy-600">Show captions on all videos by default</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Transcripts */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">Show Transcripts</h3>
                <p className="text-sm text-navy-600">Display video/audio transcripts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Alt Text */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">Show Image Descriptions</h3>
                <p className="text-sm text-navy-600">Display alt text below images</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: "✅", title: "WCAG 2.1 AAA", desc: "Highest compliance level" },
            { icon: "🗣️", title: "Screen Reader", desc: "Full ARIA support" },
            { icon: "⌨️", title: "Keyboard Only", desc: "100% navigable" },
            { icon: "🎨", title: "Color Contrast", desc: "7:1 ratio or better" },
            { icon: "📱", title: "Mobile Friendly", desc: "Touch accessibility" },
            { icon: "🌍", title: "Multi-language", desc: "20+ languages" },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-5xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-navy-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Save Your Preferences</h2>
          <p className="text-lg text-purple-100 mb-8">Changes apply to your account across all devices</p>
          <div className="flex items-center justify-center space-x-4">
            <button className="px-8 py-3 bg-white text-purple-700 rounded-lg font-semibold hover:bg-gray-100">
              Save Settings
            </button>
            <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-500 border-2 border-white">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
