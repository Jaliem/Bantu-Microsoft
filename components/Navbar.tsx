"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const navWidth = useTransform(scrollY, [0, 50], ["100%", "90%"]);
  const navPadding = useTransform(scrollY, [0, 50], ["0rem", "1rem"]);
  const navRadius = useTransform(scrollY, [0, 50], ["0rem", "1.5rem"]);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const hiddenRoutes = ["/profile", "/chat", "/wallet", "/dashboard"];
  if (hiddenRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <motion.header
      style={{ paddingLeft: navPadding, paddingRight: navPadding, paddingTop: navPadding }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
    >
      <motion.nav
        style={{ 
          width: navWidth,
          borderRadius: navRadius,
        }}
        className={cn(
          "pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[0.22, 1, 0.36, 1]",
          isScrolled 
            ? "bg-brand-light/70 backdrop-blur-xl shadow-ambient px-6 py-4" 
            : "bg-transparent px-8 py-8"
        )}
      >
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-brand-mid flex items-center justify-center shadow-ambient"
            >
              <span className="text-white font-bold font-display text-xl leading-none">B</span>
            </motion.div>
            <span className="font-display font-bold text-xl tracking-tight text-brand-dark">BANTU</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="hidden md:inline-block text-sm font-medium text-brand-dark hover:text-brand-mid transition-colors px-4 py-2">
                Dashboard
              </Link>
              <button 
                onClick={() => logout()}
                className="flex h-10 items-center justify-center px-5 rounded-lg bg-transparent text-brand-dark border border-brand-dark/10 text-sm font-medium transition-all hover:bg-black/5 active:scale-95"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:inline-block text-sm font-medium text-brand-dark hover:text-brand-mid transition-colors px-4 py-2">
                Log in
              </Link>
              <Link 
                href="/register" 
                className="flex h-10 items-center justify-center px-5 rounded-lg bg-brand-dark text-white text-sm font-medium transition-all hover:bg-brand-mid hover:shadow-ambient active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </motion.nav>
    </motion.header>
  );
}
