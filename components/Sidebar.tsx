"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, MessageSquare, Wallet, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar({ userData }: { userData: any }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  
  const avatar = userData?.avatarUrl || null;
  const name = userData?.name || "User";

  const isSettingsActive = pathname.startsWith('/profile');

  return (
    <aside className="w-64 bg-[#f2f3ff] border-r border-[#bccabc]/15 hidden md:flex flex-col min-h-screen shrink-0">
      <div className="p-8">
        <div className="text-[#006d38] font-bold tracking-wide text-xl">
          BANTU <span className="font-medium text-[#131b2e]">Premium</span>
        </div>
        {user?.emailVerified ? (
          <div className="text-[10px] uppercase font-bold text-[#3d4a3f] mt-1 tracking-wider">
            VERIFIED {userData?.role || 'UMKM'}
          </div>
        ) : (
          <div className="text-[10px] uppercase font-bold text-red-600 mt-1 tracking-wider">
            UNVERIFIED {userData?.role || 'UMKM'}
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[#3d4a3f] hover:bg-white/50 rounded-[16px] transition-colors cursor-pointer">
          <Home size={20} />
          <span className="text-sm font-medium">Home</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-[#3d4a3f] hover:bg-white/50 rounded-[16px] transition-colors cursor-pointer">
          <ClipboardList size={20} />
          <span className="text-sm font-medium">Tasks</span>
        </Link>
        <Link href="/chat" className={`flex items-center gap-3 px-4 py-3 rounded-[16px] transition-colors cursor-pointer ${pathname.startsWith('/chat') ? 'bg-white text-[#006d38] shadow-[0_4px_20px_rgba(19,27,46,0.05)] font-bold' : 'text-[#3d4a3f] hover:bg-white/50'}`}>
          <MessageSquare size={20} />
          <span className="text-sm">Chat</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-[#3d4a3f] hover:bg-white/50 rounded-[16px] transition-colors cursor-pointer">
          <Wallet size={20} />
          <span className="text-sm font-medium">Wallet</span>
        </Link>
        <Link href="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-[16px] transition-colors cursor-pointer ${isSettingsActive ? 'bg-white text-[#006d38] shadow-[0_4px_20px_rgba(19,27,46,0.05)] font-bold' : 'text-[#3d4a3f] hover:bg-white/50'}`}>
          <Settings size={20} />
          <span className="text-sm">Settings</span>
        </Link>
      </nav>

      <div className="p-4">
        <button className="w-full bg-gradient-to-br from-[#006d38] to-[#00aa5b] text-white py-3 rounded-[16px] font-semibold shadow-[0_4px_20px_rgba(19,27,46,0.05)] hover:opacity-90 transition-opacity cursor-pointer">
          Post a Project
        </button>
      </div>

      <div className="p-4 border-t border-[#bccabc]/15 mt-auto flex flex-col gap-4">
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[16px] text-red-600 bg-red-50 hover:bg-red-100 font-semibold text-sm transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Logout
        </button>

        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#dae2fd] flex items-center justify-center text-[#006d38] font-bold">
              {name.charAt(0) || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#131b2e] truncate">{name}</p>
            <p className="text-xs text-[#3d4a3f] truncate">Premium Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
