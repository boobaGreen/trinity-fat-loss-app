import React from "react";
import { HeroSection } from "../components/landing/HeroSection";
import { HowItWorks } from "../components/landing/HowItWorks";
import { SuccessStories } from "../components/landing/SuccessStories";
import { DownloadCTA } from "../components/landing/DownloadCTA";
import { ScienceSection } from "../components/landing/ScienceSection";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section con gradient background */}
      <HeroSection />
      <ScienceSection /> {/* 👈 AGGIUNTO DOPO HERO! */}
      {/* Come funziona Trinity */}
      <HowItWorks />
      {/* Success Stories testimonials */}
      <SuccessStories />
      {/* Call to Action finale */}
      <DownloadCTA />
    </div>
  );
};
