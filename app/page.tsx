"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { LogOut, User as UserIcon, LogIn, UserPlus } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CoreFeatures } from "@/components/sections/CoreFeatures";
import { RecruiterDashboard } from "@/components/sections/RecruiterDashboard";
import { SocialProof } from "@/components/sections/SocialProof";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8ff]">
        <div className="h-3 w-3 animate-pulse rounded-full bg-[#006d38]"></div>
      </div>
    );
  }

  return (
    <>  
      <main className="flex min-h-screen flex-col bg-[#f2f3ff] font-sans selection:bg-[#006d38]/20 selection:text-[#006d38]">
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <CoreFeatures />
        <RecruiterDashboard />
        <SocialProof />
        <FAQ />
        <CTA />
      </main>
    </>
  );
}
