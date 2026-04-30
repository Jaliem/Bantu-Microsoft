"use client";

import { motion, useScroll, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { user, userData, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Force compact style on non-home pages
  const isHomePage = pathname === "/";
  const shouldBeCompact = isScrolled || !isHomePage;

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
    return () => unsubscribe();
  }, [scrollY]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out print:hidden",
        shouldBeCompact 
          ? "bg-brand-light/90 backdrop-blur-xl border-b border-brand-dark/10 h-20" 
          : "bg-transparent h-28"
      )}
    >
      <nav className="container mx-auto px-6 md:px-12 flex items-center justify-between h-full">
        
        {/* Logo */}
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center">
            <span className="font-display font-bold text-2xl tracking-tighter text-brand-dark leading-none">
              BANTU<span className="text-brand-mid">.</span>
            </span>
          </Link>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-10">
            {(user 
              ? ["Marketplace", "Tasks", "Chat", "Wallet"] 
              : ["Marketplace"]
            ).map((item) => {
              const isUmkm = userData?.role === 'UMKM';
              const href = item === "Tasks" 
                ? (isUmkm ? "/dashboard/my-posts" : "/dashboard/my-tasks")
                : `/${item.toLowerCase()}`;
              
              let labelKey = item;
              if (item === "Tasks" && isUmkm) labelKey = "My Posts";
              else if (item === "Tasks") labelKey = "My Tasks";

              const label = t(labelKey);
              const isActive = pathname === href || (item === "Tasks" && pathname === href);

              return (
                <Link 
                  key={item}
                  href={href} 
                  className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-dark/50 hover:text-brand-dark transition-colors relative group font-display flex items-center h-full"
                >
                  {label}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-underline" 
                      className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-brand-mid" 
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Action Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-8 h-full">
          {user ? (
            <>
              {userData?.role === 'UMKM' && (
                <Link href="/post-project" className="flex items-center text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-mid hover:opacity-70 transition-opacity font-display">
                  {t("+ Post Project")}
                </Link>
              )}
              <Link href="/profile" className="flex items-center text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-dark/60 hover:text-brand-dark transition-colors font-display">
                {t("Profile")}
              </Link>
              <Link href="/dashboard" className="flex items-center text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-dark/60 hover:text-brand-dark transition-colors font-display">
                {t("Dashboard")}
              </Link>
              <button 
                onClick={() => logout()}
                className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-dark border-b border-brand-dark/20 hover:border-brand-dark transition-all font-display flex items-center h-fit pb-0.5 cursor-pointer"
              >
                {t("Log out")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brand-dark/50 hover:text-brand-dark transition-colors font-display h-full">
                {t("Login")}
              </Link>
              <Link 
                href="/register" 
                className="bg-brand-mid text-brand-light px-8 py-3.5 rounded-full font-display font-bold text-[0.7rem] uppercase tracking-[0.2em] shadow-lg shadow-brand-mid/20 hover:bg-brand-dark transition-all active:scale-95 flex items-center h-fit"
              >
                {t("Join Now")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Burger Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-brand-dark p-2 -mr-2 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-brand-light border-b border-brand-dark/10 shadow-ambient md:hidden py-4 px-6 flex flex-col gap-4"
          >
            {(user 
              ? ["Marketplace", "Tasks", "Chat", "Wallet"] 
              : ["Marketplace"]
            ).map((item) => {
              const isUmkm = userData?.role === 'UMKM';
              const href = item === "Tasks" 
                ? (isUmkm ? "/dashboard/my-posts" : "/dashboard/my-tasks")
                : `/${item.toLowerCase()}`;
              
              let labelKey = item;
              if (item === "Tasks" && isUmkm) labelKey = "My Posts";
              else if (item === "Tasks") labelKey = "My Tasks";

              const label = t(labelKey);

              return (
                <Link 
                  key={item}
                  href={href} 
                  className="text-sm font-bold uppercase tracking-[0.1em] text-brand-dark/70 hover:text-brand-dark py-2 font-display"
                >
                  {label}
                </Link>
              );
            })}
            
            <hr className="border-brand-dark/10 my-2" />

            {user ? (
              <>
                {userData?.role === 'UMKM' && (
                  <Link href="/post-project" className="text-sm font-bold uppercase tracking-[0.1em] text-brand-mid hover:opacity-70 py-2 font-display">
                    {t("+ Post Project")}
                  </Link>
                )}
                <Link href="/profile" className="text-sm font-bold uppercase tracking-[0.1em] text-brand-dark/70 hover:text-brand-dark py-2 font-display">
                  {t("Profile")}
                </Link>
                <Link href="/dashboard" className="text-sm font-bold uppercase tracking-[0.1em] text-brand-dark/70 hover:text-brand-dark py-2 font-display">
                  {t("Dashboard")}
                </Link>
                <button 
                  onClick={() => logout()}
                  className="text-sm text-left font-bold uppercase tracking-[0.1em] text-brand-dark hover:opacity-70 py-2 font-display cursor-pointer"
                >
                  {t("Log out")}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold uppercase tracking-[0.1em] text-brand-dark/70 hover:text-brand-dark py-2 font-display">
                  {t("Login")}
                </Link>
                <Link 
                  href="/register" 
                  className="bg-brand-mid text-brand-light px-6 py-3 rounded-full font-display font-bold text-sm text-center uppercase tracking-[0.1em] mt-2"
                >
                  {t("Join Now")}
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}