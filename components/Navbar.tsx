"use client";

import { motion, useScroll } from "framer-motion";
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

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[0.16,1,0.3,1]",
        isScrolled 
          ? "bg-brand-light/90 backdrop-blur-xl border-b border-brand-dark/10 py-4" 
          : "bg-transparent py-8"
      )}
    >
      <nav className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Logo - Using Brand Dark and Font Display */}
        <div className="flex items-center gap-12">
          <Link href="/" className="group">
            <span className="font-display font-bold text-2xl tracking-tighter text-brand-dark">
              BANTU<span className="text-brand-mid">.</span>
            </span>
          </Link>
          
          {/* Navigation Links - Using Brand Dark with Low Opacity */}
          <div className="hidden md:flex items-center gap-10">
            {(user 
              ? ["Marketplace", "Tasks", "Chat", "Wallet"] 
              : ["Marketplace"]
            ).map((item) => (
              <Link 
                key={item}
                href={item === "Tasks" ? "/dashboard/my-tasks" : `/${item.toLowerCase()}`} 
                className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-dark/50 hover:text-brand-dark transition-colors relative group font-display"
              >
                {item}
                {(pathname === `/${item.toLowerCase()}` || (item === "Tasks" && pathname === "/dashboard/my-tasks")) && (
                  <motion.div 
                    layoutId="nav-underline" 
                    className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-brand-mid" 
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-8">
          {user ? (
            <>
              {userData?.role === 'UMKM' && (
                <Link href="/post-project" className="hidden md:inline-block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-mid hover:opacity-70 transition-opacity font-display">
                  + Post Project
                </Link>
              )}
              <Link href="/profile" className="hidden md:inline-block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-dark/60 hover:text-brand-dark transition-colors font-display">
                Profile
              </Link>
              <Link href="/dashboard" className="hidden md:inline-block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-dark/60 hover:text-brand-dark transition-colors font-display">
                Dashboard
              </Link>
              <button 
                onClick={() => logout()}
                className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-dark border-b border-brand-dark/20 hover:border-brand-dark transition-all pb-0.5 font-display"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:inline-block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-dark/50 hover:text-brand-dark transition-colors font-display">
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-brand-mid text-brand-light px-8 py-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] transition-all hover:bg-brand-dark active:scale-95 rounded-full font-display shadow-lg shadow-brand-mid/20"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}