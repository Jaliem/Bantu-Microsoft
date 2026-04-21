"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

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
      <div className="flex min-h-screen items-center justify-center bg-[#faf8ff]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#006d38] border-t-transparent"></div>
      </div>
    );
  }

  const tabs = [
    { name: "Informasi Pribadi", path: "/profile" },
    { name: "Keamanan", path: "/profile/keamanan" },
    { name: "Notifikasi", path: "/profile/notifikasi" },
  ];

  return (
    <div className="flex min-h-screen bg-[#faf8ff] font-sans">
      <Sidebar userData={userData} />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#131b2e] font-display tracking-tight">Account Settings</h1>
              <p className="text-[#3d4a3f] mt-2 text-sm">Manage your personal information, security, and preferences.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-[#bccabc]/20 mb-8">
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`pb-4 text-sm font-semibold cursor-pointer transition-colors ${
                      isActive
                        ? "border-b-2 border-[#006d38] text-[#006d38]"
                        : "text-[#3d4a3f]/70 hover:text-[#131b2e]"
                    }`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </div>

            {/* Children renders the active tab content */}
            {/* Pass userData to children. In Next.js App Router, passing props to children in layout is tricky. 
                Instead of passing as props, the child page components will fetch what they need or we use a context.
                For simplicity, we let the children fetch or use auth context. */}
            {children}
          </div>
        </div>
        
        <Footer />
      </main>
    </div>
  );
}
