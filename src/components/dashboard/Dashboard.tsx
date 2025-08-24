import React from "react";
import { useAuth } from "../../hooks/useAuth";

interface DashboardProps {
  userData: {
    name: string;
    goal: string;
    level: string;
    languages: string[];
    age: number;
  };
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userData, onLogout }) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    if (onLogout) onLogout();
  };

  // Mock data per ora - poi verrà dal database
  const mockData = {
    trioName: "The Transformers",
    members: ["Sarah", userData.name, "Elena"],
    currentDay: 47,
    totalDays: 90,
    currentStreak: 12,
    completedTasks: 5,
    totalTasks: 7,
    completionPercentage: 71,
    tasks: [
      { name: "Deficit Calorico", completed: true, emoji: "🍽️" },
      { name: "Protein Target", completed: true, emoji: "💪" },
      { name: "Hydration", completed: true, emoji: "💧" },
      { name: "Meal Logging", completed: true, emoji: "📝" },
      { name: "Sleep Quality", completed: false, emoji: "😴" },
      { name: "Steps: 8,547 / 8,000", completed: true, emoji: "👟" },
      { name: "Cardio: 0 min / 20 min", completed: false, emoji: "❤️" },
    ],
    chatMessages: [
      {
        sender: "Sarah",
        message: "Great job on steps today!",
        time: "10 min ago",
      },
      { sender: "Elena", message: "Who's joining the call?", time: "2h ago" },
    ],
    nextCall: {
      date: "Tuesday",
      time: "8:00 PM",
      confirmed: false,
    },
    achievement: {
      name: "🔥 Fire Starter Badge",
      description: "3 perfect days in a row",
    },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="px-6 py-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {getGreeting()}, {userData.name}! ☀️
              </h1>
              <p className="text-blue-100 mt-1">
                Welcome to your Trinity dashboard
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                👤
              </div>
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white"
                title="Logout"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Trio Overview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h2 className="font-semibold mb-2">
              👥 Your Trio: "{mockData.trioName}"
            </h2>
            <div className="flex items-center space-x-2 text-sm text-blue-100 mb-2">
              <span>{mockData.members.join(" • ")}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span>
                Day {mockData.currentDay} of {mockData.totalDays}
              </span>
              <span>🔥 {mockData.currentStreak} day streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Progress Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              ⭐ Today's Progress: {mockData.completedTasks}/
              {mockData.totalTasks}
            </h3>
            <span className="text-2xl">✨</span>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${mockData.completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {mockData.completionPercentage}% Complete
            </p>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">📋 Daily Tasks</h3>
          <div className="space-y-3">
            {mockData.tasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    task.completed
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {task.completed ? "✅" : "❌"}
                </div>
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-lg">{task.emoji}</span>
                  <span
                    className={
                      task.completed ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {task.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trio Chat Preview */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">💬 Trio Chat Preview</h3>
          <div className="space-y-3">
            {mockData.chatMessages.map((msg, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {msg.sender.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{msg.sender}:</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors">
            Open Chat →
          </button>
        </div>

        {/* Next Video Call */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">📹 Next Video Call</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {mockData.nextCall.date} {mockData.nextCall.time}
              </p>
              <p className="text-sm text-gray-500">
                {mockData.nextCall.confirmed ? "Confirmed" : "Not confirmed"}
              </p>
            </div>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Confirm Availability
            </button>
          </div>
        </div>

        {/* Recent Achievement */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">🏆 Recent Achievement</h3>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="font-medium">
                {mockData.achievement.name} Unlocked!
              </p>
              <p className="text-yellow-100 text-sm">
                {mockData.achievement.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            📊 View Full Progress
          </button>
          <button className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
            ✏️ Complete Missing Tasks
          </button>
        </div>

        {/* User Info Summary (for testing) */}
        <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-600">
          <h4 className="font-medium mb-2">User Summary:</h4>
          <div>👤 Name: {userData.name}</div>
          <div>🎯 Goal: {userData.goal}</div>
          <div>💪 Level: {userData.level}</div>
          <div>🗣️ Languages: {userData.languages.join(", ")}</div>
          <div>🎂 Age: {userData.age}</div>
          <div>📧 Email: {user?.email}</div>
        </div>
      </div>
    </div>
  );
};
