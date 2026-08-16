import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gamification & Achievements",
  description: "Earn points, badges, and climb the leaderboard",
};

export default function GamificationPage() {
  const achievements = [
    { name: "First Steps", icon: "👣", desc: "Complete your first assignment", rarity: "Common", points: 10 },
    { name: "Perfect Score", icon: "💯", desc: "Get 100% on an assignment", rarity: "Rare", points: 50 },
    { name: "Study Streak", icon: "🔥", desc: "7 consecutive days of activity", rarity: "Epic", points: 100 },
    { name: "Research Master", icon: "🎓", desc: "Publish your first paper", rarity: "Legendary", points: 500 },
  ];

  const leaderboard = [
    { rank: 1, name: "Sarah J.", points: 2847, level: 15, avatar: "SJ" },
    { rank: 2, name: "Michael C.", points: 2654, level: 14, avatar: "MC" },
    { rank: 3, name: "Amina H.", points: 2431, level: 14, avatar: "AH" },
    { rank: 4, name: "David K.", points: 2198, level: 13, avatar: "DK" },
    { rank: 5, name: "You", points: 1847, level: 12, avatar: "YO" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">🎮 Gamification & Achievements</h1>
          <p className="text-xl text-violet-100 max-w-3xl">
            Earn points, unlock badges, compete on leaderboards, and make learning fun!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Points", value: "1,847", icon: "⭐" },
            { label: "Current Level", value: "12", icon: "🎯" },
            { label: "Achievements", value: "24/50", icon: "🏆" },
            { label: "Global Rank", value: "#5", icon: "📊" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 text-center border-t-4 border-violet-500">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-navy-900">{stat.value}</div>
              <div className="text-sm text-navy-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Achievements */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">🏆 Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`p-6 border-2 rounded-xl ${
                    achievement.rarity === "Legendary"
                      ? "border-yellow-500 bg-yellow-50"
                      : achievement.rarity === "Epic"
                      ? "border-purple-500 bg-purple-50"
                      : achievement.rarity === "Rare"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-navy-900">{achievement.name}</h3>
                        <span className="text-xs font-semibold px-2 py-1 bg-white rounded-full">
                          {achievement.rarity}
                        </span>
                      </div>
                      <p className="text-sm text-navy-600 mb-2">{achievement.desc}</p>
                      <div className="flex items-center text-xs font-semibold text-violet-600">
                        +{achievement.points} points
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-8 p-6 bg-violet-50 rounded-xl border border-violet-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-navy-700">Level 12 Progress</span>
                <span className="text-sm font-semibold text-violet-600">847 / 2000 XP</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full" style={{ width: "42%" }}></div>
              </div>
              <p className="text-xs text-navy-500 mt-2">1,153 XP until Level 13</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">📊 Leaderboard</h2>
            <div className="space-y-3">
              {leaderboard.map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    player.name === "You"
                      ? "bg-gradient-to-r from-violet-100 to-purple-100 border-2 border-violet-500"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      player.rank === 1
                        ? "bg-yellow-500 text-white"
                        : player.rank === 2
                        ? "bg-gray-400 text-white"
                        : player.rank === 3
                        ? "bg-orange-600 text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {player.rank}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {player.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy-900">{player.name}</h3>
                    <p className="text-xs text-navy-500">Level {player.level}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-violet-600">{player.points}</div>
                    <div className="text-xs text-navy-500">points</div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/gamification/leaderboard"
              className="block mt-6 text-center py-3 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200 transition-colors"
            >
              View Full Leaderboard
            </Link>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">🎯 Active Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Week Warrior", desc: "Complete 5 assignments this week", progress: 60, reward: "+200 pts", ends: "3 days" },
              { name: "Quiz Master", desc: "Score 90%+ on 3 quizzes", progress: 33, reward: "+150 pts", ends: "5 days" },
              { name: "Social Butterfly", desc: "Help 10 classmates", progress: 80, reward: "+100 pts", ends: "2 days" },
            ].map((challenge) => (
              <div key={challenge.name} className="p-6 border-2 border-violet-200 rounded-xl hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-navy-900 mb-2">{challenge.name}</h3>
                <p className="text-sm text-navy-600 mb-4">{challenge.desc}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-navy-500">{challenge.progress}% complete</span>
                  <span className="font-semibold text-violet-600">{challenge.reward}</span>
                </div>
                <p className="text-xs text-red-600 mt-2">⏰ Ends in {challenge.ends}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Earning Points Today!</h2>
          <p className="text-lg text-violet-100 mb-8">Complete challenges, unlock achievements, and climb the leaderboard</p>
          <Link
            href="/student-portal/dashboard"
            className="inline-block px-8 py-3 bg-white text-violet-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
