"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, userData, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const navWidth = useTransform(scrollY, [0, 50], ["100%", "100%"]);
  const navPadding = useTransform(scrollY, [0, 50], ["0rem", "0rem"]);
  const navRadius = useTransform(scrollY, [0, 50], ["0rem", "0rem"]);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const hiddenRoutes = ["/dashboard", "/profile", "/chat", "/wallet", "/portfolio", "/settings", "/verify", "/login", "/register"];
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
          "pointer-events-auto flex items-center justify-between transition-all duration-300 ease-in-out border-b border-black/5",
          isScrolled 
            ? "bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 md:px-12" 
            : "bg-white px-6 py-5 md:px-12"
        )}
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-bold text-xl tracking-tight text-[#008f4c]">BANTU</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className={cn("text-sm font-medium transition-colors hover:text-[#008f4c] cursor-pointer", pathname?.startsWith("/marketplace") ? "text-[#008f4c] border-b-2 border-[#008f4c] pb-1" : "text-gray-600")}>
              Marketplace
            </Link>
            <Link href="/about" className={cn("text-sm font-medium transition-colors hover:text-[#008f4c] cursor-pointer", pathname?.startsWith("/about") ? "text-[#008f4c] border-b-2 border-[#008f4c] pb-1" : "text-gray-600")}>
              About
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {userData?.role === 'UMKM' && (
                <Link href="/post-project" className="hidden md:inline-block text-sm font-bold text-[#008f4c] hover:text-[#007a41] transition-colors cursor-pointer mr-2">
                  Post a Project
                </Link>
              )}
              <Link href="/dashboard" className="hidden md:inline-block text-sm font-medium text-gray-700 hover:text-[#008f4c] transition-colors">
                Dashboard
              </Link>
              <button 
                onClick={() => logout()}
                className="flex h-9 items-center justify-center px-4 rounded-full bg-transparent text-gray-700 border border-gray-200 text-sm font-medium transition-all hover:bg-gray-50 active:scale-95"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:inline-block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Login
              </Link>
              <Link 
                href="/register" 
                className="flex h-9 items-center justify-center px-5 rounded-full bg-[#008f4c] text-white text-sm font-medium transition-all hover:bg-[#007a41] active:scale-95"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </motion.nav>
    </motion.header>
  );
}
