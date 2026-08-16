import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Course Scheduling & Appointments",
  description: "Book office hours and schedule meetings",
};

export default function SchedulingPage() {
  const timeSlots = [
    { day: "Monday", slots: ["09:00 AM", "10:00 AM", "02:00 PM", "03:00 PM"] },
    { day: "Wednesday", slots: ["09:00 AM", "11:00 AM", "01:00 PM"] },
    { day: "Friday", slots: ["10:00 AM", "02:00 PM", "04:00 PM"] },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">📅 Course Scheduling & Appointments</h1>
          <p className="text-xl text-yellow-100 max-w-3xl">
            Book office hours, schedule meetings, and manage your calendar with automated reminders
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Available Slots", value: "24", icon: "🕐" },
            { label: "Booked This Week", value: "12", icon: "✅" },
            { label: "Avg Wait Time", value: "2 days", icon: "⏱️" },
            { label: "Success Rate", value: "98%", icon: "🎯" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Calendar View */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📆 Available Time Slots</h2>
            <div className="space-y-6">
              {timeSlots.map((day) => (
                <div key={day.day} className="border-l-4 border-yellow-500 pl-6">
                  <h3 className="font-bold text-navy-900 mb-3">{day.day}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {day.slots.map((slot) => (
                      <button
                        key={slot}
                        className="px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-sm font-semibold text-navy-700"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-navy-700">
                💡 <strong>Tip:</strong> Select a time slot to book your appointment. You'll receive email and SMS reminders.
              </p>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📝 Book Appointment</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Purpose</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
                  <option>Academic Advising</option>
                  <option>Research Discussion</option>
                  <option>Course Questions</option>
                  <option>Thesis Guidance</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">Additional Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Brief description..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">✨ Features</h2>
            <ul className="space-y-3">
              {[
                "Visual calendar interface",
                "Real-time availability",
                "Automatic Zoom link generation",
                "Email & SMS reminders",
                "Google Calendar sync",
                "Recurring appointments",
                "Waitlist management",
                "Time zone support",
                "Cancellation & rescheduling",
                "Meeting notes",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-navy-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📋 Upcoming Appointments</h2>
            <div className="space-y-4">
              {[
                { name: "John Doe", time: "Tomorrow, 10:00 AM", purpose: "Thesis Discussion" },
                { name: "Jane Smith", time: "Dec 25, 02:00 PM", purpose: "Course Questions" },
                { name: "Mike Johnson", time: "Dec 26, 11:00 AM", purpose: "Academic Advising" },
              ].map((appt, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-navy-900">{appt.name}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Confirmed</span>
                  </div>
                  <p className="text-sm text-navy-600">📅 {appt.time}</p>
                  <p className="text-sm text-navy-500">Purpose: {appt.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Book Your Appointment Today</h2>
          <p className="text-lg text-yellow-100 mb-8">Get personalized guidance and support</p>
          <button className="px-8 py-3 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            View Calendar →
          </button>
        </div>
      </div>
    </div>
  );
}
