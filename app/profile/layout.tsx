"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-mid border-t-transparent"></div>
      </div>
    );
  }

  const tabs = [
    { name: "Informasi Pribadi", path: "/profile" },
    { name: "Keamanan", path: "/profile/keamanan" },
    { name: "Notifikasi", path: "/profile/notifikasi" },
  ];

  return (
    <div className="flex h-full flex-1 bg-brand-light font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl md:text-[3rem] font-medium text-brand-dark font-display tracking-tight leading-tight">Account Settings</h1>
              <p className="text-brand-dark/60 mt-2 font-light text-lg">Manage your personal information, security, and preferences.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-brand-dark/10 mb-10">
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`pb-4 text-sm tracking-wide font-medium cursor-pointer transition-colors relative ${
                      isActive
                        ? "text-brand-dark"
                        : "text-brand-dark/40 hover:text-brand-dark/80"
                    }`}
                  >
                    {tab.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-mid" />
                    )}
                  </Link>
                );
              })}
            </div>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
