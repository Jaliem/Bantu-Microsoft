"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Hero } from "@/components/sections/Hero";
import { Solution } from "@/components/sections/Solution";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CoreFeatures } from "@/components/sections/CoreFeatures";
import { SocialProof } from "@/components/sections/SocialProof";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

export default function Home() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="relative">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-light"
          >
            <div className="h-4 w-4 animate-pulse rounded-full bg-brand-mid"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20 selection:text-primary">
        <Hero />
        <Solution />
        <HowItWorks />
        <CoreFeatures />
        <SocialProof />
        <FAQ />
        <CTA />
      </main>
    </div>
  );
}
