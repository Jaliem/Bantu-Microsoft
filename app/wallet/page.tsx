"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ShieldCheck, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Transaction {
  id: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  status: "pending" | "completed";
  createdAt: any;
}

export default function WalletPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }

    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user, router]);

  const totalBalance = transactions
    .filter(t => t.status === "completed")
    .reduce((acc, t) => t.type === "credit" ? acc + t.amount : acc - t.amount, 0);

  const totalEarned = transactions
    .filter(t => t.type === "credit" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.type === "debit" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingAmount = transactions
    .filter(t => t.status === "pending")
    .reduce((acc, t) => acc + t.amount, 0);

  const formatRp = (amount: number) =>
    `Rp ${amount.toLocaleString("id-ID")}`;

  if (loading) {
    return (
      <div className="flex h-screen bg-[#faf8ff] font-sans">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#008f4c] border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#faf8ff] font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 lg:p-12 max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl md:text-[3rem] font-medium text-gray-900 tracking-tight leading-tight">
              Wallet
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-light">
              Your earnings, spending, and escrow balance.
            </p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#00b050] to-[#008f4c] rounded-[32px] p-10 text-white mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">BANTU Wallet</p>
                  <p className="text-white/70 text-xs">{userData?.name}</p>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-2">Available Balance</p>
              <p className="text-5xl font-black tracking-tight mb-6">{formatRp(totalBalance)}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Total Earned</p>
                  <p className="font-bold text-lg">{formatRp(totalEarned)}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Total Spent</p>
                  <p className="font-bold text-lg">{formatRp(totalSpent)}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">In Escrow</p>
                  <p className="font-bold text-lg">{formatRp(pendingAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Escrow info */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex gap-4 mb-8">
            <ShieldCheck className="text-[#008f4c] shrink-0 mt-0.5" size={22} />
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">BANTU Smart Escrow</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Funds are held securely in escrow when a project is posted. Payment is automatically released to the student only when the UMKM approves the final submission. No trust issues, no disputes.
              </p>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h2>

            {transactions.length === 0 ? (
              <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100">
                <div className="w-20 h-20 bg-[#f8f9fe] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wallet size={40} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-500 mb-6">
                  {userData?.role === "Mahasiswa"
                    ? "Complete tasks to earn your first payment."
                    : "Post a project to get started."}
                </p>
                <Link
                  href={userData?.role === "Mahasiswa" ? "/marketplace" : "/post-project"}
                  className="inline-flex items-center gap-2 bg-[#008f4c] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#007a41] transition-all cursor-pointer"
                >
                  {userData?.role === "Mahasiswa" ? "Browse Marketplace" : "Post a Project"}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-[0_2px_12px_rgba(19,27,46,0.02)] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                        {tx.type === "credit"
                          ? <ArrowDownLeft size={20} />
                          : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{tx.description}</p>
                        <p className="text-xs text-gray-400">
                          {tx.createdAt?.toDate
                            ? formatDistanceToNow(tx.createdAt.toDate(), { addSuffix: true })
                            : "Just now"}
                          {" · "}
                          <span className={`font-semibold ${tx.status === "completed" ? "text-green-600" : "text-orange-500"}`}>
                            {tx.status === "completed" ? "Completed" : "Pending"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black text-lg ${tx.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                        {tx.type === "credit" ? "+" : "-"}{formatRp(tx.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
