"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Share2 } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const hiddenRoutes = ["/dashboard", "/profile", "/chat", "/wallet", "/portfolio", "/settings", "/verify", "/login", "/register"];
  
  if (hiddenRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <footer className="w-full bg-[#f8f9fe] py-16 mt-auto border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-bold text-xl tracking-tight text-[#008f4c]">BANTU</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
              Pusat pemberdayaan UMKM dan Freelancer Indonesia dengan teknologi modern.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-6 text-sm">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/marketplace" className="text-gray-500 hover:text-[#008f4c] transition-colors text-xs font-semibold tracking-wider uppercase">Marketplace</Link></li>
              <li><Link href="/guide" className="text-gray-500 hover:text-[#008f4c] transition-colors text-xs font-semibold tracking-wider uppercase">UMKM Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-6 text-sm">Bantuan</h4>
            <ul className="space-y-4">
              <li><Link href="/help" className="text-gray-500 hover:text-[#008f4c] transition-colors text-xs font-semibold tracking-wider uppercase">Help Center</Link></li>
              <li><Link href="/privacy" className="text-gray-500 hover:text-[#008f4c] transition-colors text-xs font-semibold tracking-wider uppercase">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-semibold text-gray-900 mb-6 text-sm">Syarat & Ketentuan</h4>
             <ul className="space-y-4">
               <li><Link href="/terms" className="text-gray-500 hover:text-[#008f4c] transition-colors text-xs font-semibold tracking-wider uppercase">Terms of Service</Link></li>
             </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            © 2024 BANTU INDONESIA. KARYA ANAK BANGSA.
          </div>
          <div className="flex gap-4">
             <button className="text-gray-400 hover:text-[#008f4c] transition-colors">
               <Globe size={18} />
             </button>
             <button className="text-gray-400 hover:text-[#008f4c] transition-colors">
               <Share2 size={18} />
             </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
