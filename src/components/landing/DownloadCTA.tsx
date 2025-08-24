import React from "react";

export const DownloadCTA: React.FC = () => {
  const handleDownloadClick = (platform: "ios" | "android" | "web") => {
    const urls = {
      ios: "https://apps.apple.com/app/trinity-fat-loss/id123456789",
      android:
        "https://play.google.com/store/apps/details?id=com.trinity.fatLoss",
      web: "/onboarding", // Naviga direttamente all'onboarding
    };

    if (platform === "web") {
      window.location.href = urls[platform];
    } else {
      window.open(urls[platform], "_blank");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Main Headline */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          🎯 Ready to Transform?
        </h2>

        <p className="text-xl md:text-2xl mb-12 opacity-90">
          Join thousands already transforming with trio accountability
        </p>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          {/* App Store Button */}
          <button
            onClick={() => handleDownloadClick("ios")}
            className="app-store-button"
          >
            <div className="text-2xl">📱</div>
            <div className="text-left">
              <div className="text-xs opacity-75">Download on the</div>
              <div className="text-lg font-semibold">App Store</div>
            </div>
          </button>

          {/* Google Play Button */}
          <button
            onClick={() => handleDownloadClick("android")}
            className="app-store-button"
          >
            <div className="text-2xl">🤖</div>
            <div className="text-left">
              <div className="text-xs opacity-75">Get it on</div>
              <div className="text-lg font-semibold">Google Play</div>
            </div>
          </button>
        </div>

        {/* Social Proof Stats */}
        <div className="stats-grid mb-8">
          <div className="stat-item">
            <div className="stat-number">12K+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">94%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">4.8★</div>
            <div className="stat-label">App Rating</div>
          </div>
        </div>

        {/* Web Alternative */}
        <div className="border-t border-white border-opacity-20 pt-8">
          <p className="text-lg mb-4 opacity-90">Or try our web version</p>
          <button
            onClick={() => handleDownloadClick("web")}
            className="trinity-button-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600"
          >
            🌐 Launch Web App
          </button>
        </div>

        {/* Final Call to Action */}
        <div className="mt-12">
          <p className="text-lg font-medium opacity-90">
            ✨ Start your transformation journey today
          </p>
          <p className="text-sm opacity-75 mt-2">
            Free to start • No commitments • Find your trio in 48h
          </p>
        </div>
      </div>
    </section>
  );
};
