import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#faf8ff] py-8 border-t border-[#bccabc]/15 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-[#006d38] font-bold text-xl tracking-wider">
          BANTU
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold tracking-wider text-[#3d4a3f] uppercase">
          <Link href="/privacy" className="cursor-pointer hover:text-[#006d38] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="cursor-pointer hover:text-[#006d38] transition-colors">Terms of Service</Link>
          <Link href="/help" className="cursor-pointer hover:text-[#006d38] transition-colors">Help Center</Link>
          <Link href="/guide" className="cursor-pointer hover:text-[#006d38] transition-colors">UMKM Guide</Link>
        </div>

        <div className="text-xs text-[#3d4a3f] uppercase font-semibold tracking-wider">
          © 2024 BANTU INDONESIA. KARYA ANAK BANGSA.
        </div>
      </div>
    </footer>
  );
}
