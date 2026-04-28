"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-light">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-mid border-t-transparent"></div>
      </div>
    );
  }

  const tabs = [
    { name: "Informasi Pribadi", path: "/profile" },
    { name: "Keamanan", path: "/profile/keamanan" },
    { name: "Notifikasi", path: "/profile/notifikasi" },
  ];

  return (
    <div className="min-h-screen bg-brand-light font-sans pt-28 pb-20 px-6">
      <main className="max-w-5xl mx-auto w-full">
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-brand-dark tracking-tight leading-tight"
          >
            Account Settings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-dark/40 mt-2 font-light text-lg font-sans"
          >
            Kelola informasi pribadi, keamanan, dan preferensi akun Anda.
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex gap-10 border-b border-brand-dark/5 mb-12">
          {tabs.map((tab, idx) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`pb-5 text-[10px] uppercase font-bold tracking-[0.2em] cursor-pointer transition-all relative ${
                  isActive
                    ? "text-brand-mid"
                    : "text-brand-dark/30 hover:text-brand-dark/60"
                }`}
              >
                {tab.name}
                {isActive && (
                  <motion.span 
                    layoutId="active-profile-tab"
                    className="absolute bottom-0 left-0 w-full h-[2.5px] bg-brand-mid rounded-full" 
                  />
                )}
              </Link>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
