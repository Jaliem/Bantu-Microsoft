"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { LogOut, User as UserIcon, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-8">
      <main className="flex max-w-2xl flex-col items-center text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl">
          <span className="text-4xl font-extrabold">B</span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Bantu - IOFest
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          The official web application platform. Join us to experience seamless collaboration and management.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
              >
                <UserIcon size={18} />
                Go to Profile
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors"
              >
                <LogOut size={18} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
              >
                <LogIn size={18} />
                Sign in
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-all"
              >
                <UserPlus size={18} />
                Create account
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
