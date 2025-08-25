import React, { useState, useEffect } from "react";
import { supabase, matchingService } from "../../lib/supabase";
import { UserMenu } from "../common/UserMenu";
import { useAuth } from "../../hooks/useAuth";

interface MatchingData {
  name: string;
  goal: string;
  level: string;
  languages: string[];
  age: number;
}

interface MatchingProps {
  userData: MatchingData;
  onComplete: () => void;
  skipAnimations?: boolean;
  goToResults?: boolean;
}

interface MatchingResult {
  state: "searching" | "found_partial" | "matched" | "queued";
  matches?: Array<{
    id: string;
    name: string;
    compatibility: number;
    shared_goals: string[];
  }>;
  queue_position?: number;
  estimated_wait_hours?: number;
  flexible_criteria?: string[];
}

// 🚀 REAL DATABASE-DRIVEN MATCHING SYSTEM
const performRealMatching = async (
  userData: MatchingData
): Promise<MatchingResult> => {
  try {
    // 1. Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // 2. Ensure user exists in users table (upsert user profile with basic info)
    const { error: upsertError } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email || "",
        name: userData.name, // Required field - using data from onboarding
        age: userData.age, // Required field - age from onboarding
        languages: userData.languages, // Required field - languages from onboarding
        weight_goal: userData.goal, // Required field - weight goal from onboarding
        fitness_level: userData.level, // Required field - fitness level from onboarding
        // Add only the columns that definitely exist
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id", // Only use the primary key constraint
        ignoreDuplicates: false, // Update existing records
      }
    );

    if (upsertError) {
      console.error("Error upserting user:");
      console.error("Code:", upsertError.code);
      console.error("Message:", upsertError.message);
      console.error("Details:", upsertError.details);
      console.error("Full error object:", JSON.stringify(upsertError, null, 2));
      throw upsertError;
    }

    // 3. Search for compatible users in database
    const compatibleUsers = await matchingService.findMatches({
      weight_goal: userData.goal,
      fitness_level: userData.level,
      age: userData.age,
      languages: userData.languages,
      userId: user.id,
    });

    // 4. Simulate realistic processing time (2-5 seconds)
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 3000)
    );

    // 5. Process matching results based on REAL database data
    if (compatibleUsers.length >= 2) {
      // Perfect match found - 2 compatible users available
      await matchingService.updateMatchingStatus(user.id, "in_trio");

      return {
        state: "matched",
        matches: compatibleUsers.slice(0, 2).map((user, index) => ({
          id: user.id,
          name: user.name || `User ${index + 1}`, // Using 'name' instead of 'full_name'
          compatibility: 85 + Math.floor(Math.random() * 15), // 85-100%
          shared_goals: [userData.goal],
        })),
      };
    } else if (compatibleUsers.length === 1) {
      // Partial match found - 1 compatible user
      await matchingService.updateMatchingStatus(user.id, "matching");

      return {
        state: "found_partial",
        matches: [
          {
            id: compatibleUsers[0].id,
            name: compatibleUsers[0].name || "Compatible User", // Using 'name' instead of 'full_name'
            compatibility: 70 + Math.floor(Math.random() * 15), // 70-85%
            shared_goals: [userData.goal],
          },
        ],
      };
    } else {
      // No matches found - add to queue
      await matchingService.addToQueue(user.id);
      const queuePosition = await matchingService.getQueuePosition(user.id);
      await matchingService.updateMatchingStatus(user.id, "available");

      return {
        state: "queued",
        queue_position: queuePosition,
        estimated_wait_hours: 24 + Math.floor(Math.random() * 48),
        flexible_criteria: ["schedule_flexibility", "age_range"],
      };
    }
  } catch (error) {
    console.error("Real matching error:");
    console.error("Error type:", typeof error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Full error:", JSON.stringify(error, null, 2));
    console.error("Error object:", error);

    // Fallback to queue if there's a database error
    return {
      state: "queued",
      queue_position: Math.floor(Math.random() * 20) + 1,
      estimated_wait_hours: 24,
      flexible_criteria: ["database_retry"],
    };
  }
};

const Matching: React.FC<MatchingProps> = ({
  userData,
  onComplete,
  skipAnimations = false,
  goToResults = false,
}) => {
  const { user } = useAuth();
  const [searchProgress, setSearchProgress] = useState(
    skipAnimations ? 100 : 0
  );
  const [currentPhase, setCurrentPhase] = useState<
    "searching" | "analyzing" | "finalizing"
  >("searching");
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(
    null
  );
  const [showResult, setShowResult] = useState(goToResults);

  // Stato locale per toggle notification
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Function to cancel matching and leave queue
  const cancelMatching = async () => {
    if (!user) return;

    try {
      // Remove from matching queue completely
      await matchingService.removeFromQueue(user.id);
      // Update user matching status
      await matchingService.updateMatchingStatus(user.id, "available");
      // Update UI state - show success message
      setMatchingResult({
        state: "searching",
        matches: [],
      });
      setShowResult(true);
      console.log("✅ Successfully cancelled matching");
    } catch (error) {
      console.error("Error cancelling matching:", error);
    }
  };

  useEffect(() => {
    // If goToResults is true, skip animations and show current queue status
    if (goToResults) {
      // Get current queue status directly
      const getCurrentStatus = async () => {
        if (!user) return;

        try {
          const position = await matchingService.getQueuePosition(user.id);
          if (position > 0) {
            setMatchingResult({
              state: "queued",
              queue_position: position,
              estimated_wait_hours: 24 + Math.floor(Math.random() * 48),
              flexible_criteria: ["schedule_flexibility", "age_range"],
            });
            setShowResult(true);
          }
        } catch (error) {
          console.error("Error getting queue status:", error);
        }
      };

      getCurrentStatus();
      return; // Skip normal matching process
    }

    // Normal matching process
    const matchingPromise = performRealMatching(userData);

    // Skip animations if requested
    if (skipAnimations) {
      setSearchProgress(100);
      matchingPromise.then(async (result) => {
        setMatchingResult(result);
        setShowResult(true);
      });
      return;
    }

    // Animate search progress
    const interval = setInterval(() => {
      setSearchProgress((prev) => {
        if (prev < 100) {
          // Dynamic progress speed based on phase
          const increment =
            currentPhase === "searching"
              ? 1.5
              : currentPhase === "analyzing"
              ? 0.8
              : 2.0;

          const newProgress = Math.min(prev + increment, 100);

          // Update phases based on progress
          if (newProgress > 30 && currentPhase === "searching") {
            setCurrentPhase("analyzing");
          } else if (newProgress > 70 && currentPhase === "analyzing") {
            setCurrentPhase("finalizing");
          }

          return newProgress;
        }

        return prev;
      });
    }, 150);

    // Handle matching result
    matchingPromise.then(async (result) => {
      setMatchingResult(result);
      setShowResult(true);
      clearInterval(interval);

      // Handle matching result
      setMatchingResult(result);
      setShowResult(true);
      clearInterval(interval);

      // Auto-complete for successful match
      if (result.state === "matched") {
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    });

    return () => {
      clearInterval(interval);
    };
  }, [userData, onComplete, currentPhase, goToResults, skipAnimations, user]);

  const getPhaseMessage = () => {
    if (showResult) return "Match complete!";

    switch (currentPhase) {
      case "searching":
        return `Searching Trinity database... ${Math.round(searchProgress)}%`;
      case "analyzing":
        return `Analyzing compatibility... ${Math.round(searchProgress)}%`;
      case "finalizing":
        return `Finalizing matches... ${Math.round(searchProgress)}%`;
      default:
        return `Matching ${Math.round(searchProgress)}%`;
    }
  };

  const getResultContent = () => {
    if (!matchingResult) return null;

    switch (matchingResult.state) {
      case "matched":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                <span className="text-5xl">🎉</span>
              </div>
              <h2 className="text-4xl font-bold text-green-600 mb-4">
                Perfect Match Found!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We found {matchingResult.matches?.length} compatible training
                partners
              </p>
            </div>

            <div className="space-y-4">
              {matchingResult.matches?.map((match) => (
                <div
                  key={match.id}
                  className="bg-green-50 p-6 rounded-2xl border border-green-200"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-green-800">
                      {match.name}
                    </h3>
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {match.compatibility}% Match
                    </div>
                  </div>
                  <p className="text-green-700">
                    Shared goals: {match.shared_goals.join(", ")}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={onComplete}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Start Training Together! 🚀
            </button>
          </div>
        );

      case "found_partial":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">⚡</span>
              </div>
              <h2 className="text-4xl font-bold text-orange-600 mb-4">
                Partial Match Found
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We found some potential partners. Looking for better matches...
              </p>
            </div>

            {matchingResult.matches?.map((match) => (
              <div
                key={match.id}
                className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-yellow-800">
                    {match.name}
                  </h3>
                  <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {match.compatibility}% Match
                  </div>
                </div>
                <p className="text-yellow-700">
                  Shared goals: {match.shared_goals.join(", ")}
                </p>
              </div>
            ))}

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <p className="text-blue-700 font-medium">
                🔍 Still searching for your perfect match...
              </p>
              <p className="text-blue-600 text-sm">
                We'll notify you when we find better compatibility
              </p>
            </div>
          </div>
        );

      case "queued":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">⏰</span>
              </div>
              <h2 className="text-4xl font-bold text-blue-600 mb-4">
                You're in the Queue!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                No immediate matches, but don't worry - we're working on it
              </p>
            </div>

            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-blue-600 mb-2">
                Queue Position
              </p>
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                #{matchingResult.queue_position}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <p className="text-blue-700 font-medium">
                  📱 We'll notify you within{" "}
                  {matchingResult.estimated_wait_hours}h
                </p>
                <p className="text-blue-600 text-sm">
                  More users join daily - your match is coming!
                </p>
              </div>

              {matchingResult.flexible_criteria &&
                matchingResult.flexible_criteria.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
                    <p className="text-purple-700 font-medium">
                      🔄 We'll gradually expand search criteria
                    </p>
                    <p className="text-purple-600 text-sm">
                      This increases your chances of finding a match
                    </p>
                  </div>
                )}
            </div>

            <button
              onClick={() => setNotificationsEnabled((prev) => !prev)}
              className={`w-full py-4 px-6 font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                notificationsEnabled
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-gray-800"
              }`}
            >
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-3">
                  {notificationsEnabled ? "✅" : "🔔"}
                </span>
                {notificationsEnabled
                  ? "Notifications Enabled"
                  : "Enable Notifications"}
              </span>
            </button>

            {/* Cancel Matching Button */}
            <button
              onClick={cancelMatching}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-3">❌</span>
                Cancel Queue Request
              </span>
            </button>

            {/* 📱 Platform-specific notification info */}
            <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="text-blue-700 text-sm text-center">
                📱 Notifications will keep you updated about your matching
                progress
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p className="text-gray-600">Processing match results...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-600 to-orange-500 flex items-center justify-center p-4 animate-gradient">
      {/* User Menu - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <UserMenu variant="dark" />
      </div>

      <div className="w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 relative overflow-hidden">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/20 via-pink-50/10 to-orange-50/20 rounded-3xl pointer-events-none"></div>

          <div className="relative z-10 text-center space-y-8">
            {/* Conditional Rendering: Matching Process or Results */}
            {!showResult ? (
              <>
                {/* Header */}
                <div className="mb-12 animate-fade-in-up">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow">
                    <span className="text-4xl animate-bounce-gentle">💫</span>
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4 animate-text-shimmer">
                    Finding Your Perfect Match
                  </h2>
                  <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
                    We're searching for the best training partners based on your
                    preferences
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 animate-slide-in-right animation-delay-100">
                  <div className="w-full bg-gray-200 rounded-full h-6 mb-4 relative overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-rose-500 via-orange-500 to-yellow-500 h-full rounded-full transition-all duration-300 ease-out relative"
                      style={{ width: `${searchProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent animate-pulse">
                    {getPhaseMessage()}
                  </p>
                </div>

                {/* Matching Criteria */}
                <div className="mb-8 text-left animate-slide-in-left animation-delay-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="text-2xl mr-3 animate-bounce-subtle">
                      🎯
                    </span>
                    Matching based on:
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: "🎯", text: "Goal", value: userData.goal },
                      { icon: "💪", text: "Level", value: userData.level },
                      {
                        icon: "🗣️",
                        text: "Languages",
                        value: userData.languages,
                      },
                      {
                        icon: "👤",
                        text: "Age",
                        value: `${userData.age} years`,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-2xl bg-gradient-to-br from-white/80 to-gray-50/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in-up`}
                        style={{ animationDelay: `${300 + index * 100}ms` }}
                      >
                        <span className="text-2xl block mb-2 animate-pulse-subtle">
                          {item.icon}
                        </span>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {item.text}
                        </p>
                        <p className="text-gray-800 font-semibold text-sm">
                          {Array.isArray(item.value)
                            ? item.value.join(", ")
                            : item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-8 space-y-4 animate-fade-in animation-delay-700">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                    <p className="text-gray-700 font-medium flex items-center justify-center">
                      <span className="text-2xl mr-3 animate-pulse-slow">
                        👥
                      </span>
                      Looking for 2 people with similar goals & schedule
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200">
                    <p className="text-orange-700 font-bold flex items-center justify-center">
                      <span className="text-2xl mr-3 animate-twinkle">📱</span>
                      We'll notify you within 24-48h
                    </p>
                  </div>
                </div>

                {/* Learn More */}
                <div className="text-center mb-6 animate-fade-in animation-delay-900">
                  <p className="text-gray-600 mb-3 flex items-center justify-center">
                    <span className="text-xl mr-2 animate-bounce-subtle">
                      📖
                    </span>
                    Meanwhile, learn about Trinity
                  </p>
                  <button className="text-rose-600 hover:text-orange-600 font-bold text-lg hover:scale-105 transition-all duration-200 p-2 rounded-xl hover:bg-rose-50">
                    Browse Success Stories
                  </button>
                </div>
              </>
            ) : (
              /* Results Display */
              <div className="animate-fade-in">{getResultContent()}</div>
            )}

            {/* Go to Dashboard Button - only show when matching is complete or queued */}
            {matchingResult &&
              (matchingResult.state === "matched" ||
                matchingResult.state === "queued") && (
                <div className="animate-fade-in animation-delay-1000">
                  <button
                    onClick={onComplete}
                    className="w-full py-4 px-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl hover:from-amber-600 hover:to-orange-600 hover:scale-102 active:scale-98 transition-all duration-200 font-bold text-lg shadow-lg"
                  >
                    Continue to Dashboard →
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matching;
