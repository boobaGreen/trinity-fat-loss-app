import React, { useState } from "react";

interface UserData {
  name: string;
  age: number;
  languages: string[];
  weightGoal: string;
}

interface DataCollectionScreenProps {
  userName: string;
  onNext: (data: UserData) => void;
  onBack: () => void;
}

export const DataCollectionScreen: React.FC<DataCollectionScreenProps> = ({
  userName,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<UserData>({
    name: userName,
    age: 28,
    languages: [],
    weightGoal: "",
  });

  const handleLanguageToggle = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleSubmit = () => {
    if (formData.languages.length > 0 && formData.weightGoal) {
      onNext(formData);
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
                Welcome {userName}! ✏️
              </h2>
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700">
              👋 Let's find your perfect
              <br />
              transformation trio
            </p>
          </div>

          {/* Age Section */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-3">
              🎂 How old are you?
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    age: parseInt(e.target.value),
                  }))
                }
                className="trinity-input text-center text-lg"
                min="18"
                max="65"
              />
            </div>
          </div>

          {/* Languages Section */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-3">
              🌍 Which languages do you speak fluently? (Select all)
            </label>
            <div className="flex space-x-4">
              {["English", "Italiano"].map((language) => (
                <label
                  key={language}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={() => handleLanguageToggle(language)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">{language}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Weight Goal Section */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-3">
              🎯 What's your weight loss goal?
            </label>
            <div className="space-y-3">
              {[
                { value: "5-10kg", label: "5-10kg (Moderate change)" },
                { value: "10-15kg", label: "10-15kg (Solid results)" },
                { value: "15+kg", label: "15+ kg (Major transformation)" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="weightGoal"
                    value={option.value}
                    checked={formData.weightGoal === option.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        weightGoal: e.target.value,
                      }))
                    }
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleSubmit}
            disabled={formData.languages.length === 0 || !formData.weightGoal}
            className="w-full trinity-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Final Step
          </button>

          {/* Social Proof */}
          <p className="text-center text-sm text-gray-600 mt-4">
            ✨ 92% find their trio in 48h
          </p>
        </div>
      </div>
    </div>
  );
};
