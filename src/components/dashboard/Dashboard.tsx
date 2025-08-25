import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { matchingService } from "../../lib/supabase";
import { UserMenu } from "../common/UserMenu";

interface DashboardProps {
  userData: {
    name: string;
    goal: string;
    level: string;
    languages: string[];
    age: number;
  };
  onLogout?: () => void;
  onGoToMatching?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userData,
  onGoToMatching,
}) => {
  const { user } = useAuth();
  const [matchingStatus, setMatchingStatus] = useState<{
    isInQueue: boolean;
    position?: number;
    loading: boolean;
  }>({ isInQueue: false, loading: true });

  // Check matching status on component load
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;

      try {
        // Check if user is in matching queue
        const position = await matchingService.getQueuePosition(user.id);
        setMatchingStatus({
          isInQueue: position > 0,
          position: position > 0 ? position : undefined,
          loading: false,
        });
      } catch (error) {
        console.log("User not in matching queue:", error);
        setMatchingStatus({ isInQueue: false, loading: false });
      }
    };

    checkStatus();
  }, [user]);

  const goToMatchingStatus = () => {
    // Use callback to go to matching with special state
    if (onGoToMatching) {
      onGoToMatching();
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
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
            <UserMenu variant="dark" />
          </div>

          {/* Matching Status */}
          {!matchingStatus.loading && matchingStatus.isInQueue && (
            <div className="bg-amber-500/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-amber-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    🔍 Looking for your Trinity partners
                  </h3>
                  <p className="text-amber-100 text-sm">
                    {matchingStatus.position && matchingStatus.position > 1
                      ? `Position ${matchingStatus.position} in queue`
                      : "Searching for compatible matches..."}
                  </p>
                </div>
                <button
                  onClick={goToMatchingStatus}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                >
                  View Status
                </button>
              </div>
            </div>
          )}

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
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              ⭐ Today's Progress: {mockData.completedTasks}/
              {mockData.totalTasks}
            </h3>
            <span className="text-2xl animate-pulse">✨</span>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${mockData.completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {mockData.completionPercentage}% Complete
            </p>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold mb-4">📋 Daily Tasks</h3>
          <div className="space-y-3">
            {mockData.tasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-sm ${
                    task.completed
                      ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                      : "bg-gray-200/80 text-gray-400"
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
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold mb-4">💬 Trio Chat Preview</h3>
          <div className="space-y-3">
            {mockData.chatMessages.map((msg, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-medium text-white shadow-md">
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
          <button className="w-full mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 py-2 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200/50 shadow-sm">
            Open Chat →
          </button>
        </div>

        {/* Next Video Call */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold mb-4">📹 Next Video Call</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {mockData.nextCall.date} {mockData.nextCall.time}
              </p>
              <p className="text-sm text-gray-500">
                {mockData.nextCall.confirmed
                  ? "✅ Confirmed"
                  : "⏳ Not confirmed"}
              </p>
            </div>
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md">
              Confirm Availability
            </button>
          </div>
        </div>

        {/* Recent Achievement */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white rounded-xl p-6 shadow-lg border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-2">
              🏆 Recent Achievement
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-3xl animate-bounce">🔥</span>
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
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg backdrop-blur-sm border border-white/20">
            📊 View Full Progress
          </button>
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg backdrop-blur-sm border border-white/20">
            ✏️ Complete Missing Tasks
          </button>
        </div>

        {/* User Info Summary (for testing) */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-sm text-gray-700 shadow-md border border-white/30">
          <h4 className="font-medium mb-2 text-gray-800">User Summary:</h4>
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
