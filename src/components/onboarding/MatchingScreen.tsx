import React, { useState, useEffect } from "react";

interface MatchingData {
  name: string; // ✅ Aggiunta proprietà name
  goal: string;
  level: string;
  languages: string[];
  age: number;
}

interface MatchingScreenProps {
  userData: MatchingData;
  onComplete: () => void;
  onBack?: () => void; // ✅ Aggiunta prop opzionale onBack
}

export const MatchingScreen: React.FC<MatchingScreenProps> = ({
  userData,
  onComplete,
  onBack,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-400 flex items-center justify-center p-4 animate-gradient">
      <div className="max-w-md w-full animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 rounded-3xl pointer-events-none"></div>

          <div className="relative z-10 text-center">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-2xl font-bold text-gray-800 mb-3 flex items-center justify-center">
                <span className="text-3xl mr-3 animate-spin-slow">🔍</span>
                Finding your trio...
              </h1>
              <p className="text-gray-600 text-lg">
                <span className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent font-semibold">
                  Searching for perfect matches
                </span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 animate-slide-in-right animation-delay-100">
              <div className="w-full bg-gray-200 rounded-full h-6 mb-4 relative overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-rose-500 via-orange-500 to-yellow-500 h-full rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent animate-pulse">
                Matching {progress}%
              </p>
            </div>

            {/* Matching Criteria */}
            <div className="mb-8 text-left animate-slide-in-left animation-delay-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-3 animate-bounce-subtle">🎯</span>
                Matching based on:
              </h3>
              <div className="space-y-4">
                {[
                  { label: `Goal: ${userData.goal} loss`, delay: "300ms" },
                  { label: `Level: ${userData.level}`, delay: "400ms" },
                  {
                    label: `Language: ${userData.languages.join(", ")}`,
                    delay: "500ms",
                  },
                  {
                    label: `Age: Compatible (${userData.age - 5}-${
                      userData.age + 5
                    })`,
                    delay: "600ms",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-green-50/70 border border-green-200 animate-slide-in-right hover:scale-102 transition-transform duration-200"
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="relative">
                      <span className="text-green-500 text-xl animate-bounce-in">
                        ✅
                      </span>
                      <div className="absolute inset-0 w-6 h-6 bg-green-400 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="mb-8 space-y-4 animate-fade-in animation-delay-700">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <p className="text-gray-700 font-medium flex items-center justify-center">
                  <span className="text-2xl mr-3 animate-pulse-slow">👥</span>
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

            {/* Enable Notifications Button */}
            <div className="animate-fade-in-up animation-delay-800">
              <button className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 to-orange-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group mb-6">
                <span className="relative z-10 flex items-center justify-center">
                  <span className="text-2xl mr-3">🔔</span>
                  Enable Push Notifications
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out"></div>
              </button>
            </div>

            {/* Learn More */}
            <div className="text-center mb-6 animate-fade-in animation-delay-900">
              <p className="text-gray-600 mb-3 flex items-center justify-center">
                <span className="text-xl mr-2 animate-bounce-subtle">📖</span>
                Meanwhile, learn about Trinity
              </p>
              <button className="text-rose-600 hover:text-orange-600 font-bold text-lg hover:scale-105 transition-all duration-200 p-2 rounded-xl hover:bg-rose-50">
                Browse Success Stories
              </button>
            </div>

            {/* Back Button */}
            {onBack && (
              <div className="animate-fade-in animation-delay-1000">
                <button
                  onClick={onBack}
                  className="w-full py-3 px-6 text-gray-600 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 hover:scale-102 active:scale-98 transition-all duration-200 font-medium"
                >
                  ← Back to Fitness Level
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
