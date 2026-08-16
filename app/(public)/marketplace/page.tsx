import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resource Marketplace",
  description: "Buy and sell educational resources",
};

export default function MarketplacePage() {
  const items = [
    { id: 1, title: "Calculus Complete Notes", price: 19.99, seller: "Prof. Adams", rating: 4.9, downloads: 234 },
    { id: 2, title: "Statistics Dataset Collection", price: 29.99, seller: "Dr. Brown", rating: 4.8, downloads: 189 },
    { id: 3, title: "Linear Algebra Video Course", price: 49.99, seller: "Prof. Chen", rating: 5.0, downloads: 456 },
    { id: 4, title: "Python for Data Science", price: 0, seller: "Dr. Wilson", rating: 4.7, downloads: 892 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">🛒 Resource Marketplace</h1>
          <p className="text-xl text-teal-100 max-w-3xl">
            Buy and sell educational resources - lecture notes, datasets, code, and more
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search resources..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
            />
            <select className="px-4 py-3 border border-gray-300 rounded-lg">
              <option>All Categories</option>
              <option>Lecture Notes</option>
              <option>Datasets</option>
              <option>Code</option>
              <option>Templates</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg">
              <option>All Prices</option>
              <option>Free</option>
              <option>Under $20</option>
              <option>$20-$50</option>
              <option>Over $50</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Resources", value: "1,234", icon: "📚" },
            { label: "Sellers", value: "156", icon: "👥" },
            { label: "Total Sales", value: "$45K", icon: "💰" },
            { label: "Avg Rating", value: "4.8", icon: "⭐" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-teal-400 to-emerald-600 aspect-video flex items-center justify-center">
                <div className="text-white text-5xl">📄</div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-navy-900 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-navy-600 mb-3">by {item.seller}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold text-navy-900">{item.rating}</span>
                  </div>
                  <span className="text-xs text-navy-500">📥 {item.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-teal-600">
                    {item.price === 0 ? "FREE" : `$${item.price}`}
                  </span>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700">
                    {item.price === 0 ? "Download" : "Buy Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Become a Seller */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Become a Seller</h2>
          <p className="text-lg text-teal-100 mb-8">Share your knowledge and earn money</p>
          <Link
            href="/marketplace/sell"
            className="inline-block px-8 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Selling →
          </Link>
        </div>
      </div>
    </div>
  );
}
