import React from "react";

const testimonials = [
  {
    name: "Sarah",
    age: 32,
    story: "Lost 12kg with Maria and Paolo supporting me daily!",
    avatar: "👩‍💼",
    result: "12kg lost",
  },
  {
    name: "Marco",
    age: 28,
    story: "Best fitness experience ever - couldn't have done it alone",
    avatar: "👨‍💻",
    result: "8kg lost",
  },
  {
    name: "Elena",
    age: 35,
    story: "Finally found people who understand my struggles",
    avatar: "👩‍🏫",
    result: "15kg lost",
  },
];

export const SuccessStories: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 Success Stories
          </h2>
          <p className="text-xl text-gray-600">
            Real transformations from real trio members
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="trinity-card hover:shadow-xl transition-all duration-300"
            >
              {/* Avatar */}
              <div className="text-6xl text-center mb-4">
                {testimonial.avatar}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 text-lg italic mb-4 text-center">
                "{testimonial.story}"
              </blockquote>

              {/* Author */}
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  {testimonial.name}, {testimonial.age}
                </p>
                <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  ✅ {testimonial.result}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Before/After Gallery Placeholder */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            📸 Amazing Transformations
          </h3>
          <p className="text-lg opacity-90 mb-6">
            Before/After photo gallery with trio testimonials
          </p>
          <button className="trinity-button-secondary bg-white text-blue-600 hover:bg-gray-100">
            View Transformation Gallery
          </button>
        </div>
      </div>
    </section>
  );
};
