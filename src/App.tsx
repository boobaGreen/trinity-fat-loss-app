function App() {
  return (
    <>
      {/* Test Tailwind Base Classes */}
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        {/* Test Custom Tailwind Colors (se hai configurato @theme) */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚀 Trinity Fat Loss
          </h1>

          {/* Test Responsive & Spacing */}
          <p className="text-gray-600 mb-6 text-lg">
            Tailwind CSS v4 is working!
          </p>

          {/* Test Colors & Hover Effects */}
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
            Click to Test Hover 💪
          </button>

          {/* Test Flexbox & Grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-red-400 h-12 rounded-lg"></div>
            <div className="bg-green-400 h-12 rounded-lg"></div>
            <div className="bg-blue-400 h-12 rounded-lg"></div>
          </div>

          {/* Test Typography */}
          <p className="text-sm text-gray-500 mt-4 font-medium">
            Click on the Vite and React logos to learn more
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
