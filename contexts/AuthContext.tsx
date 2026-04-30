"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserData {
  role: "UMKM" | "Mahasiswa";
  name: string;
  email: string;
  avatarUrl?: string;
  verified?: boolean;
  rank?: "S" | "A" | "B" | "C" | "D";
  completedTasks?: number;
  avgRating?: number;
  ratingCount?: number;
  totalEarnings?: number;
  university?: string;
  skills?: string[];
  bio?: string;
  savedProjects?: string[];
  isOnline?: boolean;
  lastActive?: any;
  hideAiScores?: boolean;
  hideRatings?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentUserUid: string | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Cookie check for session persistence limit
      if (currentUser && typeof document !== "undefined") {
        if (!document.cookie.includes("bantu_session=true")) {
          await firebaseSignOut(auth);
          setUser(null);
          setUserData(null);
          setLoading(false);
          return;
        }
      }

      setUser(currentUser);
      if (currentUser) {
        currentUserUid = currentUser.uid;
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
            await updateDoc(docRef, {
              isOnline: true,
              lastActive: new Date()
            }).catch(() => {});
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        if (currentUserUid) {
          updateDoc(doc(db, "users", currentUserUid), {
            isOnline: false,
            lastActive: new Date()
          }).catch(() => {});
        }
        currentUserUid = null;
        setUserData(null);
      }
      setLoading(false);
    });

    const handleVisibilityChange = () => {
      if (currentUserUid) {
        const docRef = doc(db, "users", currentUserUid);
        if (document.visibilityState === "visible") {
          updateDoc(docRef, { isOnline: true, lastActive: new Date() }).catch(() => {});
        } else {
          updateDoc(docRef, { isOnline: false, lastActive: new Date() }).catch(() => {});
        }
      }
    };
    
    const handleBeforeUnload = () => {
      if (currentUserUid) {
        updateDoc(doc(db, "users", currentUserUid), { isOnline: false, lastActive: new Date() }).catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
