import React, { useState } from "react";
import { LandingPage } from "./pages/LandingPage";
import { WelcomeScreen } from "./components/onboarding/WelcomeScreen";
import { DataCollectionScreen } from "./components/onboarding/DataCollectionScreen";
import { FitnessLevelScreen } from "./components/onboarding/FitnessLevelScreen";
import { MatchingScreen } from "./components/onboarding/MatchingScreen";

type AppScreen =
  | "landing"
  | "welcome"
  | "data-collection"
  | "fitness-level"
  | "matching"
  | "dashboard";

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("landing");
  const [userProgress, setUserProgress] = useState({
    name: "",
    loginMethod: "",
    userData: null,
    fitnessLevel: "",
  });

  const handleOnboardingStep = (screen: AppScreen, data?: any) => {
    setCurrentScreen(screen);
    if (data) {
      setUserProgress((prev) => ({ ...prev, ...data }));
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "landing":
        return <LandingPage />;

      case "welcome":
        return (
          <WelcomeScreen
            onNext={(method) =>
              handleOnboardingStep("data-collection", {
                loginMethod: method,
                name: "User",
              })
            }
          />
        );

      case "data-collection":
        return (
          <DataCollectionScreen
            userName={userProgress.name}
            onNext={(data) =>
              handleOnboardingStep("fitness-level", { userData: data })
            }
            onBack={() => setCurrentScreen("welcome")}
          />
        );

      case "fitness-level":
        return (
          <FitnessLevelScreen
            onNext={(level) =>
              handleOnboardingStep("matching", { fitnessLevel: level })
            }
            onBack={() => setCurrentScreen("data-collection")}
          />
        );

      case "matching":
        return (
          <MatchingScreen
            userData={{
              goal: userProgress.userData?.weightGoal || "10-15kg",
              level: userProgress.fitnessLevel,
              languages: userProgress.userData?.languages || ["English"],
              age: userProgress.userData?.age || 28,
            }}
            onComplete={() => handleOnboardingStep("dashboard")}
          />
        );

      case "dashboard":
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Welcome to Trinity!
              </h1>
              <p className="text-gray-600">
                Your trio matching is complete. Dashboard coming soon...
              </p>
            </div>
          </div>
        );

      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="App">
      {renderCurrentScreen()}

      {/* Development Navigation (remove in production) */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 text-xs">
        <button
          onClick={() => setCurrentScreen("landing")}
          className="block mb-1 text-blue-600"
        >
          Landing
        </button>
        <button
          onClick={() => setCurrentScreen("welcome")}
          className="block mb-1 text-blue-600"
        >
          Welcome
        </button>
        <button
          onClick={() => setCurrentScreen("data-collection")}
          className="block mb-1 text-blue-600"
        >
          Data
        </button>
        <button
          onClick={() => setCurrentScreen("fitness-level")}
          className="block mb-1 text-blue-600"
        >
          Fitness
        </button>
        <button
          onClick={() => setCurrentScreen("matching")}
          className="block text-blue-600"
        >
          Matching
        </button>
      </div>
    </div>
  );
}

export default App;
