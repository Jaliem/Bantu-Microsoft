"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 sm:px-6 pt-4"
    >
      <nav
        className={cn(
          "pointer-events-auto w-full flex items-center justify-between transition-colors duration-500",
          "bg-[#ffffff]/80 backdrop-blur-[20px] shadow-[0_4px_20px_rgba(19,27,46,0.05)]",
          "px-4 sm:px-6 lg:px-8 py-4 border-b border-white/20"
        )}
      >
        <div className="flex items-center gap-2 text-[#006d38]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-2xl bg-[#006d38] flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-[#ffffff] font-bold font-sans text-lg leading-none">B</span>
            </div>
            <span className="font-sans font-bold text-xl tracking-tighter text-[#131b2e]">BANTU</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-[0.875rem] font-medium text-[#3d4a3f] hover:text-[#131b2e] transition-colors font-sans">How it works</Link>
          <Link href="#" className="text-[0.875rem] font-medium text-[#3d4a3f] hover:text-[#131b2e] transition-colors font-sans">Features</Link>
          <Link href="#" className="text-[0.875rem] font-medium text-[#3d4a3f] hover:text-[#131b2e] transition-colors font-sans">For Recruiters</Link>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/login" className="hidden md:inline-block text-[0.875rem] font-medium text-[#3d4a3f] hover:text-[#006d38] transition-colors font-sans">
            Log in
          </Link>
          <Link 
            href="/register" 
            className="flex h-11 items-center justify-center px-6 rounded-2xl bg-[#006d38] text-[#ffffff] text-[0.875rem] font-medium transition-all hover:opacity-90 active:scale-95 shadow-[0_4px_20px_rgba(19,27,46,0.05)]"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
