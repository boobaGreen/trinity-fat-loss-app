import React from "react";

const steps = [
  {
    emoji: "1️⃣",
    title: "MATCH",
    description: "Get paired with 2 compatible partners",
    icon: "🎯",
  },
  {
    emoji: "2️⃣",
    title: "SUPPORT",
    description: "Daily chat + motivation from your trio",
    icon: "💬",
  },
  {
    emoji: "3️⃣",
    title: "CONNECT",
    description: "Weekly 20-min video problem-solving",
    icon: "📹",
  },
  {
    emoji: "4️⃣",
    title: "TRACK",
    description: "7 daily + 4 weekly tasks together",
    icon: "📊",
  },
  {
    emoji: "5️⃣",
    title: "TRANSFORM",
    description: "90-day journey with real accountability",
    icon: "🏆",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ✨ How Trinity Works:
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands in a proven system that combines accountability,
            support, and results
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-5 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Step Number */}
              <div className="text-4xl mb-4">{step.emoji}</div>

              {/* Card */}
              <div className="trinity-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector arrow (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-4 -translate-y-1/2">
                  <div className="text-2xl text-blue-400">→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
