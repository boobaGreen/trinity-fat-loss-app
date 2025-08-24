import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Trinity Logo Visual */}
        <div className="mb-8 flex justify-center items-center space-x-4 text-6xl">
          <span className="animate-bounce" style={{ animationDelay: "0s" }}>
            🏃‍♂️
          </span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
            👥
          </span>
          <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
            🏃‍♀️
          </span>
        </div>

        {/* Science Badge */}
        <div className="mb-6 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
          <span className="mr-2">🧠</span>
          Basato su 15+ Studi Harvard • Stanford • Domini University
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Il Primo Sistema Fitness con
          <span className="block mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            70% di Successo
          </span>
          <span className="block mt-2 text-3xl md:text-5xl lg:text-6xl">
            Garantito dalla Scienza
          </span>
        </h1>

        {/* Tagline Semplificata - AGGIORNATA ✅ */}
        <p className="text-xl md:text-2xl mb-8 opacity-90 font-medium max-w-4xl mx-auto leading-relaxed">
          Insieme è meglio: <strong>raggiungi i tuoi obiettivi</strong> con il
          supporto di due compagni.
          <span className="block mt-2 text-lg md:text-xl text-blue-200">
            🔬 "Transform together. Three minds, one goal."
          </span>
        </p>

        {/* Science Stats */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">70%</div>
            <div className="text-sm">Più Successo vs Obiettivi Individuali</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-green-400">46%</div>
            <div className="text-sm">Maggior Mantenimento Risultati</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-purple-400">95%</div>
            <div className="text-sm">Fallisce Da Solo vs Trinity Success</div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-12 space-y-4">
          <p className="text-lg font-semibold">
            Unisciti a 12,000+ persone che perdono peso insieme in gruppo
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <span>🧠</span>
              <span>3 meccanismi psicologici attivati</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <span>📊</span>
              <span>695+ sessioni analizzate</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <span>🎯</span>
              <span>83% non molla primi 2 mesi</span>
            </div>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button className="trinity-button-primary text-lg px-8 py-4 min-w-[220px] bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl">
            📱 Scarica iOS App
          </button>
          <button className="trinity-button-primary text-lg px-8 py-4 min-w-[220px] bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl">
            🤖 Scarica Android
          </button>
          <button className="trinity-button-secondary text-lg px-8 py-4 min-w-[220px] border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
            🌐 Prova Web App
          </button>
        </div>

        {/* Scientific CTA */}
        <div className="mb-8">
          <button className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-12 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            🧠 Unisciti al 70% che Raggiunge Davvero i Propri Obiettivi
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm opacity-80">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>Gratis per iniziare</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>Trio garantito in 48h</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>Nessun impegno iniziale</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔬</span>
            <span>Metodo scientificamente provato</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};
