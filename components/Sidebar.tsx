"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ClipboardList, MessageSquare, Briefcase, Wallet, Settings, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user, userData } = useAuth();

  const isProfileActive = pathname?.startsWith('/profile');

  return (
    <aside className="w-64 bg-[#f8f9fe] border-r border-gray-100 hidden md:flex flex-col min-h-screen shrink-0">
      <div className="p-8">
        <div className="text-[#008f4c] font-bold tracking-tight text-2xl">
          BANTU <span className="font-semibold text-gray-900 text-lg">Premium</span>
        </div>
        <div className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-widest">
          {userData?.role === 'UMKM' ? 'VERIFIED UMKM PARTNER' : 'VERIFIED MAHASISWA'}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${pathname === '/dashboard' ? 'bg-white text-[#008f4c] font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
          <Home size={20} />
          <span className="text-sm">Home</span>
        </Link>
        <Link href="/marketplace" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${pathname?.startsWith('/marketplace') ? 'bg-white text-[#008f4c] font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
          <LayoutGrid size={20} />
          <span className="text-sm">Marketplace</span>
        </Link>
        
        {userData?.role === 'UMKM' ? (
          <Link href="/dashboard/my-posts" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${pathname === '/dashboard/my-posts' ? 'bg-white text-[#008f4c] font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
            <ClipboardList size={20} />
            <span className="text-sm">My Posts</span>
          </Link>
        ) : (
          <Link href="/dashboard/my-tasks" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${pathname === '/dashboard/my-tasks' ? 'bg-white text-[#008f4c] font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
            <ClipboardList size={20} />
            <span className="text-sm">My Tasks</span>
          </Link>
        )}

        <Link href="/chat" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${pathname?.startsWith('/chat') ? 'bg-white text-[#008f4c] font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
          <MessageSquare size={20} />
          <span className="text-sm">Chat</span>
        </Link>
        
        {userData?.role === 'Mahasiswa' && (
          <Link href="/portfolio" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${pathname?.startsWith('/portfolio') ? 'bg-white text-[#008f4c] font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
            <Briefcase size={20} />
            <span className="text-sm">Create Portfolio</span>
          </Link>
        )}

        <Link href="/wallet" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-white/50 transition-all cursor-pointer">
          <Wallet size={20} />
          <span className="text-sm">Wallet</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-100 mt-auto flex flex-col gap-4">
        <Link href="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${isProfileActive ? 'bg-white text-[#008f4c] font-bold shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
          <Settings size={20} />
          <span className="text-sm">Profile</span>
        </Link>
        
        {userData?.role === 'UMKM' && (
          <Link href="/post-project" className="w-full flex items-center justify-center gap-2 bg-[#008f4c] hover:bg-[#007a41] text-white py-3 rounded-full font-semibold transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)] cursor-pointer">
            <PlusCircle size={18} /> Post a Project
          </Link>
        )}
      </div>
    </aside>
  );
}
