import React, { useState } from "react";

interface FitnessLevelScreenProps {
  onNext: (fitnessLevel: string) => void;
  onBack: () => void;
}

const fitnessLevels = [
  {
    level: "beginner",
    emoji: "🌱",
    title: "Beginner",
    description: "New to fitness & diet tracking",
  },
  {
    level: "intermediate",
    emoji: "⚡",
    title: "Intermediate",
    description: "Some gym & healthy eating exp",
  },
  {
    level: "advanced",
    emoji: "🔥",
    title: "Advanced",
    description: "Regular athlete/fitness pro",
  },
];

export const FitnessLevelScreen: React.FC<FitnessLevelScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const handleSubmit = () => {
    if (selectedLevel) {
      onNext(selectedLevel);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button onClick={onBack} className="text-2xl">
              ←
            </button>
            <div className="flex-1 text-center">
              <h2 className="text-xl font-bold text-gray-900">
                Ready for transformation!
              </h2>
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700">
              🏆 Final step: experience level
            </p>
          </div>

          {/* Fitness Level Selection */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-6">
              💪 Your current fitness experience:
            </label>

            <div className="space-y-4">
              {fitnessLevels.map((option) => (
                <button
                  key={option.level}
                  onClick={() => setSelectedLevel(option.level)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedLevel === option.level
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Find Trio Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedLevel}
            className="w-full trinity-button-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            🔍 Find My Perfect Trio
          </button>

          {/* Social Proof */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              ✨ 94% love their trio experience
            </p>
            <p className="text-sm text-gray-600">Ready to join them?</p>
          </div>
        </div>
      </div>
    </div>
  );
};
