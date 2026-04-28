"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";

export function Footer() {
  const { user, userData } = useAuth();
  const pathname = usePathname();
  const hiddenRoutes = ["/dashboard", "/profile", "/chat", "/wallet", "/portfolio", "/settings", "/verify", "/login", "/register"];
  
  if (hiddenRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <footer className="w-full bg-brand-mid py-24 mt-auto relative overflow-hidden print:hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16">
          
          {/* Brand & Description */}
          <div className="max-w-md">
            <div className="mb-10">
              <span className="font-display font-bold text-3xl tracking-tighter text-white">
                BANTU<span className="text-brand-light">.</span>
              </span>
            </div>
            <p className="text-brand-light/70 text-lg leading-relaxed font-sans font-light text-balance">
              Pemberdayaan UMKM Indonesia melalui kolaborasi dengan talenta mahasiswa terbaik. 
              Membangun ekonomi lokal, satu proyek sekaligus.
            </p>
          </div>
          
          {/* Navigations */}
          <div className="flex flex-col gap-8">
            <h4 className="font-display font-bold text-white text-[10px] uppercase tracking-[0.25em]">Navigasi</h4>
            <div className="flex flex-col gap-4">
              {(user 
                ? ["Marketplace", "Tasks", "Chat", "Wallet"] 
                : ["Marketplace"]
              ).map((item) => (
                <Link 
                  key={item}
                  href={item === "Tasks" ? "/dashboard/my-tasks" : `/${item.toLowerCase()}`} 
                  className="text-brand-light/60 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest"
                >
                  {item}
                </Link>
              ))}
              
              {user ? (
                <>
                  {userData?.role === 'UMKM' && (
                    <Link href="/post-project" className="text-brand-light/60 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest">
                      Post Project
                    </Link>
                  )}
                  <Link href="/profile" className="text-brand-light/60 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest">
                    Profile
                  </Link>
                  <Link href="/dashboard" className="text-brand-light/60 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-brand-light/60 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest">
                    Login
                  </Link>
                  <Link href="/register" className="text-brand-light/60 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="mt-24 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-[10px] font-bold tracking-[0.3em] text-brand-light/30 uppercase">
            © 2024 BANTU INDONESIA. KARYA ANAK BANGSA.
          </div>
        </div>
      </div>
    </footer>
  );
}
