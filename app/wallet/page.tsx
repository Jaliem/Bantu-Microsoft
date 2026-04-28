"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ShieldCheck, Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }

    const fetchTransactions = async () => {
      if (!user) return;
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
  }, [user, authLoading, router]);

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
      <div className="flex h-screen bg-brand-light font-sans items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light font-sans pt-28 pb-20 px-6">
      <main className="max-w-5xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-dark tracking-tight">
              Wallet
            </h1>
            <p className="text-brand-dark/40 mt-2 text-lg font-sans font-light">
              Kelola pendapatan, pengeluaran, dan saldo escrow Anda.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <button className="bg-white text-brand-dark font-display font-bold py-3 px-6 rounded-2xl text-[10px] uppercase tracking-widest shadow-ambient border border-brand-dark/5 hover:bg-brand-dark hover:text-white transition-all">
              Tarik Saldo
            </button>
            <button className="bg-brand-mid text-white font-display font-bold py-3 px-6 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand-mid/20 hover:bg-brand-dark transition-all">
              Isi Saldo
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-brand-dark rounded-[2.5rem] p-10 md:p-12 text-white relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-mid/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Wallet size={24} className="text-brand-mid" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">BANTU Escrow Wallet</p>
                    <p className="text-white/80 font-display font-bold">{userData?.name}</p>
                  </div>
                </div>
                <CreditCard size={24} className="text-white/20" />
              </div>

              <div className="mt-auto">
                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.15em] mb-3">Available Balance</p>
                <h2 className="text-5xl md:text-6xl font-display font-black tracking-tighter mb-10">
                  {formatRp(totalBalance)}
                </h2>
                
                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/10">
                  <div>
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-2">Earned</p>
                    <p className="font-display font-bold text-lg text-brand-mid">{formatRp(totalEarned)}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-2">Spent</p>
                    <p className="font-display font-bold text-lg text-white/80">{formatRp(totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-2">In Escrow</p>
                    <p className="font-display font-bold text-lg text-white/80">{formatRp(pendingAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Secure Escrow Info Card */}
          <div className="flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-brand-mid rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden flex-1"
            >
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-display font-bold mb-4">BANTU Secure Payments</h3>
                <p className="text-white/80 text-sm leading-relaxed font-sans font-light">
                  Dana Anda dipegang aman di escrow dan hanya dicairkan setelah proyek disetujui. Aman bagi UMKM, terjamin bagi Mahasiswa.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 border border-brand-dark/5 shadow-ambient flex items-center gap-5"
            >
              <div>
                <h4 className="font-display font-bold text-sm text-brand-dark">Top Up Mudah</h4>
                <p className="text-[11px] text-brand-dark/40 font-sans">Mendukung QRIS, Bank Transfer, dan E-Wallet.</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Transaction History Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History size={20} className="text-brand-mid" />
              <h2 className="text-2xl font-display font-bold text-brand-dark">Transaction History</h2>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/30 hover:text-brand-mid transition-colors">
              Lihat Semua
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border border-brand-dark/5 shadow-ambient">
              <div className="w-24 h-24 bg-brand-light/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-dark/5">
                <Wallet size={40} className="text-brand-dark/10" />
              </div>
              <h3 className="text-2xl font-display font-bold text-brand-dark mb-3">Belum ada transaksi</h3>
              <p className="text-brand-dark/40 mb-10 font-sans font-light max-w-xs mx-auto">
                {userData?.role === "Mahasiswa"
                  ? "Selesaikan tugas pertama Anda untuk melihat riwayat pembayaran di sini."
                  : "Posting proyek pertama Anda untuk memulai transaksi."}
              </p>
              <Link
                href={userData?.role === "Mahasiswa" ? "/marketplace" : "/post-project"}
                className="inline-flex items-center gap-3 bg-brand-dark text-white font-display font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-brand-mid transition-all shadow-xl shadow-brand-dark/10"
              >
                {userData?.role === "Mahasiswa" ? "Cari Proyek" : "Posting Proyek"}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {transactions.map((tx, idx) => (
                  <motion.div 
                    key={tx.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[2rem] p-6 md:p-8 border border-brand-dark/5 shadow-ambient flex items-center justify-between gap-6 hover:border-brand-mid/20 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${tx.type === "credit" ? "bg-brand-mid/10 text-brand-mid group-hover:bg-brand-mid group-hover:text-white" : "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white"}`}>
                        {tx.type === "credit"
                          ? <ArrowDownLeft size={22} />
                          : <ArrowUpRight size={22} />}
                      </div>
                      <div>
                        <p className="font-display font-bold text-brand-dark text-base group-hover:text-brand-mid transition-colors">{tx.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[10px] text-brand-dark/30 font-bold uppercase tracking-wider">
                            {tx.createdAt?.toDate
                              ? formatDistanceToNow(tx.createdAt.toDate(), { addSuffix: true })
                              : "Baru saja"}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-brand-dark/10" />
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${tx.status === "completed" ? "text-brand-mid" : "text-orange-500"}`}>
                            {tx.status === "completed" ? "Completed" : "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-display font-black tracking-tighter ${tx.type === "credit" ? "text-brand-mid" : "text-red-500"}`}>
                        {tx.type === "credit" ? "+" : "-"}{formatRp(tx.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
