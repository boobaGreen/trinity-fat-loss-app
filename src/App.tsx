import { useState, useEffect } from "react";
import { LandingPage } from "./pages/LandingPage";
import { WelcomeScreen } from "./components/onboarding/WelcomeScreen";
import { EmailAuth } from "./components/auth/EmailAuth";
import { EmailVerification } from "./components/auth/EmailVerification";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { ResetPassword } from "./components/auth/ResetPassword";
import { DataCollectionScreen } from "./components/onboarding/DataCollectionScreen";
import { FitnessLevelScreen } from "./components/onboarding/FitnessLevelScreen";

import { Dashboard } from "./components/dashboard/Dashboard";
import { useAuth } from "./hooks/useAuth";
import Matching from "./components/onboarding/Matching";

type AppScreen =
  | "landing"
  | "welcome"
  | "email-auth"
  | "email-verification"
  | "forgot-password"
  | "reset-password"
  | "data-collection"
  | "fitness-level"
  | "matching"
  | "dashboard";

// ✅ Aggiunto tipo per i dati utente dal form
interface UserData {
  name: string;
  age: number;
  languages: string[];
  weightGoal: string;
}

interface UserProgress {
  name: string;
  loginMethod: string;
  userData: {
    name: string;
    age: number;
    languages: string[];
    weightGoal: string;
  } | null;
  fitnessLevel: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("landing");
  const [userProgress, setUserProgress] = useState<UserProgress>({
    name: "",
    loginMethod: "",
    userData: null,
    fitnessLevel: "",
  });

  // 🔐 Hook per l'autenticazione
  const { user, loading } = useAuth();

  // Check for password reset on page load
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (type === "recovery" && accessToken) {
      setCurrentScreen("reset-password");
    }
  }, []);

  // 🎯 Listener per l'auth state - quando l'utente si autentica via OAuth
  useEffect(() => {
    if (user && !loading) {
      console.log("🔐 User authenticated:", user.email);

      // Check if user needs email verification
      if (user.email_confirmed_at === null) {
        console.log("📧 User needs email verification");
        setCurrentScreen("email-verification");
        return;
      }

      // Se l'utente è appena arrivato da OAuth e non ha completato l'onboarding
      if (currentScreen === "landing" || currentScreen === "welcome") {
        console.log("🚀 Redirecting to data collection after OAuth");

        // Aggiorna il progresso con i dati dell'utente autenticato
        setUserProgress((prev) => ({
          ...prev,
          name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Google User",
          loginMethod: user.app_metadata?.provider || "google",
        }));

        // Naviga direttamente alla raccolta dati
        setCurrentScreen("data-collection");
      }
    }
  }, [user, loading, currentScreen]);

  // 🎯 Handler per step dell'onboarding
  const handleOnboardingStep = (
    screen: AppScreen,
    data?: Partial<UserProgress>
  ) => {
    setCurrentScreen(screen);
    if (data) {
      setUserProgress((prev) => ({ ...prev, ...data }));
    }
  };

  // 🎯 Handler per navigazione diretta all'onboarding (chiamato dai CTA della Landing)
  const handleStartOnboarding = () => {
    setCurrentScreen("welcome");
  };

  const renderCurrentScreen = () => {
    // 🔄 Loading screen durante l'autenticazione iniziale
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin text-6xl mb-4">⚪</div>
            <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
            <p className="text-lg opacity-90">
              Setting up your Trinity experience
            </p>
          </div>
        </div>
      );
    }

    switch (currentScreen) {
      case "landing":
        return <LandingPage onStartOnboarding={handleStartOnboarding} />;

      case "welcome":
        return (
          <WelcomeScreen
            onNext={(method: string) => {
              if (method === "email") {
                setCurrentScreen("email-auth");
              } else {
                handleOnboardingStep("data-collection", {
                  loginMethod: method,
                  name:
                    method === "google"
                      ? "Google User"
                      : method === "apple"
                      ? "Apple User"
                      : "User",
                });
              }
            }}
            onBack={() => setCurrentScreen("landing")}
          />
        );

      case "email-auth":
        return (
          <EmailAuth
            onSuccess={(isSignUp) => {
              if (isSignUp) {
                setCurrentScreen("email-verification");
              } else {
                handleOnboardingStep("data-collection", {
                  loginMethod: "email",
                  name: "Email User",
                });
              }
            }}
            onBack={() => setCurrentScreen("welcome")}
            onForgotPassword={() => setCurrentScreen("forgot-password")}
          />
        );

      case "email-verification":
        return (
          <EmailVerification
            onContinue={() => {
              handleOnboardingStep("data-collection", {
                loginMethod: "email",
                name: user?.email?.split("@")[0] || "Email User",
              });
            }}
            onBack={() => setCurrentScreen("email-auth")}
          />
        );

      case "forgot-password":
        return (
          <ForgotPassword
            onSuccess={() => {
              alert("Password reset email sent! Check your inbox.");
              setCurrentScreen("email-auth");
            }}
            onBack={() => setCurrentScreen("email-auth")}
          />
        );

      case "reset-password":
        return (
          <ResetPassword
            onSuccess={() => {
              alert("Password updated successfully! You can now sign in.");
              setCurrentScreen("email-auth");
            }}
            onError={(error) => {
              alert(error);
              setCurrentScreen("forgot-password");
            }}
          />
        );

      case "data-collection":
        return (
          <DataCollectionScreen
            userName={userProgress.name}
            onNext={(data: UserData) =>
              handleOnboardingStep("fitness-level", { userData: data })
            }
            onBack={() => setCurrentScreen("welcome")}
          />
        );

      case "fitness-level":
        return (
          <FitnessLevelScreen
            userData={userProgress.userData}
            onNext={(level: string) =>
              handleOnboardingStep("matching", { fitnessLevel: level })
            }
            onBack={() => setCurrentScreen("data-collection")}
          />
        );

      case "matching":
        return (
          <Matching
            userData={{
              name: userProgress.name,
              goal: userProgress.userData?.weightGoal || "10-15kg",
              level: userProgress.fitnessLevel,
              languages: userProgress.userData?.languages || ["English"],
              age: userProgress.userData?.age || 28,
            }}
            onComplete={() => setCurrentScreen("dashboard")}
          />
        );

      case "dashboard":
        return (
          <Dashboard
            userData={{
              name: userProgress.name,
              goal: userProgress.userData?.weightGoal || "10-15kg",
              level: userProgress.fitnessLevel,
              languages: userProgress.userData?.languages || ["English"],
              age: userProgress.userData?.age || 28,
            }}
            onLogout={() => {
              setCurrentScreen("landing");
              setUserProgress({
                name: "",
                loginMethod: "",
                userData: null,
                fitnessLevel: "",
              });
            }}
          />
        );

      default:
        return <LandingPage onStartOnboarding={handleStartOnboarding} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentScreen()}

      {/* Development Navigation (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 text-xs z-50">
          <div className="font-semibold mb-2 text-gray-700">
            Dev Navigation:
          </div>
          <button
            onClick={() => setCurrentScreen("landing")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "landing"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            🏠 Landing
          </button>
          <button
            onClick={() => setCurrentScreen("welcome")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "welcome"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            👋 Welcome
          </button>
          <button
            onClick={() => setCurrentScreen("email-auth")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "email-auth"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            📧 Email Auth
          </button>
          <button
            onClick={() => setCurrentScreen("data-collection")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "data-collection"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            📊 Data
          </button>
          <button
            onClick={() => setCurrentScreen("fitness-level")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "fitness-level"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            💪 Fitness
          </button>
          <button
            onClick={() => setCurrentScreen("matching")}
            className={`block mb-1 px-2 py-1 rounded ${
              currentScreen === "matching"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            🔄 Matching
          </button>
          <button
            onClick={() => setCurrentScreen("dashboard")}
            className={`block px-2 py-1 rounded ${
              currentScreen === "dashboard"
                ? "bg-blue-100 text-blue-800"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            🏆 Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
