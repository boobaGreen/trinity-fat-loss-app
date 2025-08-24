import React from "react";

interface WelcomeScreenProps {
  onNext: (loginMethod: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const handleSocialLogin = (method: string) => {
    // Here you'd integrate with actual authentication
    console.log(`Login with ${method}`);
    onNext(method);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Trinity Visual */}
          <div className="mb-8 flex justify-center items-center space-x-2 text-4xl">
            <span className="animate-pulse">🏃‍♂️</span>
            <span className="animate-pulse" style={{ animationDelay: "0.3s" }}>
              👥
            </span>
            <span className="animate-pulse" style={{ animationDelay: "0.6s" }}>
              🏃‍♀️
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trinity Fat Loss
          </h1>
          <p className="text-lg text-gray-600 mb-2">"Transform together.</p>
          <p className="text-lg text-gray-600 mb-8">Three minds, one goal."</p>

          {/* Subtitle */}
          <p className="text-gray-700 mb-12">
            Join thousands transforming with trio accountability
          </p>

          {/* Social Login Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handleSocialLogin("email")}
              className="w-full trinity-button bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <span>📧</span>
              <span>Continue with Email</span>
            </button>

            <button
              onClick={() => handleSocialLogin("google")}
              className="w-full trinity-button bg-red-500 text-white hover:bg-red-600 flex items-center justify-center space-x-2"
            >
              <span>🔍</span>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => handleSocialLogin("apple")}
              className="w-full trinity-button bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center space-x-2"
            >
              <span>🍎</span>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 mt-8 leading-relaxed">
            By continuing, you agree to our
            <br />
            <span className="text-blue-600">Terms of Service</span> &{" "}
            <span className="text-blue-600">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};
