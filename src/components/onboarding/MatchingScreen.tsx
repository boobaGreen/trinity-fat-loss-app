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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🔍 Finding your trio...
            </h2>
            <p className="text-gray-600">Searching for perfect matches</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-lg font-semibold text-gray-700">
              Matching {progress}%
            </p>
          </div>

          {/* Matching Criteria */}
          <div className="mb-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Matching based on:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700">
                  Goal: {userData.goal} loss
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700">Level: {userData.level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700">
                  Language: {userData.languages.join(", ")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700">
                  Age: Compatible ({userData.age - 5}-{userData.age + 5})
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              👥 Looking for 2 people with similar goals & schedule
            </p>
            <p className="text-blue-600 font-semibold">
              📱 We'll notify you within 24-48h
            </p>
          </div>

          {/* Enable Notifications Button */}
          <button className="w-full trinity-button-primary mb-6">
            Enable Push Notifications
          </button>

          {/* Learn More */}
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              📖 Meanwhile, learn about Trinity
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Browse Success Stories
            </button>
          </div>

          {/* Back Button */}
          {onBack && (
            <div className="mt-6">
              <button
                onClick={onBack}
                className="w-full trinity-button-secondary text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                ← Back to Fitness Level
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
