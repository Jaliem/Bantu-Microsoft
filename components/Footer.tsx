"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const hiddenRoutes = ["/profile", "/chat", "/wallet", "/dashboard"];
  
  if (hiddenRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <footer className="w-full bg-brand-light py-16 mt-auto border-t border-brand-dark/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-mid flex items-center justify-center">
                <span className="text-white font-bold font-display text-xl leading-none">B</span>
              </div>
              <span className="font-display font-bold text-2xl tracking-tighter text-brand-dark">BANTU</span>
            </div>
            <p className="text-brand-dark/60 max-w-sm leading-relaxed font-light text-lg text-balance">
              Empowering the next generation of Indonesian talent through real-world experience and local business growth.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-brand-dark mb-6 tracking-tight">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#how-it-works" className="text-brand-dark/60 hover:text-brand-mid transition-colors font-light">How it works</Link></li>
              <li><Link href="#features" className="text-brand-dark/60 hover:text-brand-mid transition-colors font-light">Features</Link></li>
              <li><Link href="/explore" className="text-brand-dark/60 hover:text-brand-mid transition-colors font-light">Explore Tasks</Link></li>
              <li><Link href="/register" className="text-brand-dark/60 hover:text-brand-mid transition-colors font-light">Join as Talent</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-brand-dark mb-6 tracking-tight">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-brand-dark/60 hover:text-brand-mid transition-colors font-light">About Us</Link></li>
              <li><Link href="/privacy" className="text-brand-dark/60 hover:text-brand-mid transition-colors font-light">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-brand-dark/60 hover:text-brand-mid transition-colors font-light">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-brand-dark/60 hover:text-brand-mid transition-colors font-light">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-brand-dark/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-brand-dark/40 font-mono uppercase tracking-widest">
            © 2024 BANTU INDONESIA. KARYA ANAK BANGSA.
          </div>
          <div className="flex gap-6">
             <div className="text-xs text-brand-dark/40 font-mono uppercase tracking-widest hover:text-brand-mid cursor-pointer transition-colors">
               LINKEDIN
             </div>
             <div className="text-xs text-brand-dark/40 font-mono uppercase tracking-widest hover:text-brand-mid cursor-pointer transition-colors">
               INSTAGRAM
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
