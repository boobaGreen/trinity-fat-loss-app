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
import { supabase, matchingService } from "./lib/supabase";

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

  // New state to track user status
  const [userStatus, setUserStatus] = useState<{
    hasProfile: boolean;
    isInQueue: boolean;
    isInTrio: boolean;
    loading: boolean;
  }>({
    hasProfile: false,
    isInQueue: false,
    isInTrio: false,
    loading: true,
  });

  // 🔐 Hook per l'autenticazione
  const { user, loading } = useAuth();

  // Check user status in database
  const checkUserStatus = async (userId: string) => {
    try {
      // Check if user has complete profile
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select(
          "id, name, age, languages, weight_goal, fitness_level, matching_status"
        )
        .eq("id", userId)
        .single();

      if (profileError) {
        console.log("User profile not found, needs onboarding");
        setUserStatus({
          hasProfile: false,
          isInQueue: false,
          isInTrio: false,
          loading: false,
        });
        return;
      }

      // Check if user is in matching queue
      let isInQueue = false;
      try {
        const position = await matchingService.getQueuePosition(userId);
        isInQueue = position > 0;
      } catch {
        isInQueue = false;
      }

      // Check if user is in a trio (simplified check for now)
      const isInTrio = userProfile.matching_status === "in_trio";

      // Check if profile is complete
      const hasCompleteProfile = !!(
        userProfile.name &&
        userProfile.age &&
        userProfile.languages &&
        userProfile.weight_goal &&
        userProfile.fitness_level
      );

      setUserStatus({
        hasProfile: hasCompleteProfile,
        isInQueue,
        isInTrio,
        loading: false,
      });

      console.log("👤 User status:", {
        hasProfile: hasCompleteProfile,
        isInQueue,
        isInTrio,
      });
    } catch (error) {
      console.error("Error checking user status:", error);
      setUserStatus({
        hasProfile: false,
        isInQueue: false,
        isInTrio: false,
        loading: false,
      });
    }
  };

  // Check for password reset on page load
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (type === "recovery" && accessToken) {
      setCurrentScreen("reset-password");
    }
  }, []);

  // 🎯 Smart routing based on user authentication and status
  useEffect(() => {
    if (!loading && user) {
      console.log("🔐 User authenticated:", user.email);

      // Check if user needs email verification
      if (user.email_confirmed_at === null) {
        console.log("📧 User needs email verification");
        setCurrentScreen("email-verification");
        return;
      }

      // Check user status in database
      checkUserStatus(user.id);
    } else if (!loading && !user) {
      // User not authenticated, go to landing
      setCurrentScreen("landing");
    }
  }, [user, loading]);

  // Route based on user status
  useEffect(() => {
    if (!userStatus.loading && user) {
      if (userStatus.isInTrio) {
        console.log("🎯 User has trio, going to dashboard");
        setCurrentScreen("dashboard");
      } else if (userStatus.isInQueue) {
        console.log("🔍 User in matching queue, going to dashboard");
        setCurrentScreen("dashboard");
      } else if (userStatus.hasProfile) {
        console.log("� User has profile but no trio, going to matching");
        setCurrentScreen("matching");
      } else {
        console.log("🏠 User needs onboarding, showing landing page first");
        // User doesn't have complete profile, show landing page first
        // so they understand what Trinity is before starting onboarding
        setCurrentScreen("landing");
      }
    }
  }, [userStatus, user]);

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
    // If user is already authenticated but needs onboarding, prepare OAuth data
    if (user) {
      setUserProgress((prev) => ({
        ...prev,
        name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        loginMethod: user.app_metadata?.provider || "google",
      }));
      setCurrentScreen("data-collection");
    } else {
      // User not authenticated, show welcome screen first
      setCurrentScreen("welcome");
    }
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
