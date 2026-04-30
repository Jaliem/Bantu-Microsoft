"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck, Wallet, ArrowUpRight, ArrowDownLeft, History,
  X, Loader2, ExternalLink, Building2, RefreshCw, XCircle, CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

interface Transaction {
  id: string;
  projectId?: string;
  projectTitle?: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  status: "pending" | "completed" | "cancelled";
  createdAt: any;
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

const formatRp = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

function TopUpSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (searchParams.get("topup") === "success") {
      toast.success("Pembayaran berhasil! Saldo akan diperbarui setelah konfirmasi.");
      router.replace("/wallet");
    }
  }, [searchParams, router]);
  return null;
}

export default function WalletPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number | "">("");
  const [topUpPhone, setTopUpPhone] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawRef, setWithdrawRef] = useState<string | null>(null);

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

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
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

  const handleTopUp = async () => {
    if (!topUpAmount || topUpAmount < 10000) {
      toast.error("Minimum top up Rp 10.000");
      return;
    }
    setTopUpLoading(true);
    try {
      const res = await fetch("/api/mayar/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user!.uid,
          userEmail: user!.email,
          userName: userData?.name ?? user!.displayName ?? "User",
          userPhone: topUpPhone || "08000000000",
          amount: topUpAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal membuat link pembayaran");
        return;
      }
      setPaymentUrl(data.paymentUrl);
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleCancelTransaction = async (tx: Transaction) => {
    setCancelLoading(true);
    try {
      await updateDoc(doc(db, "transactions", tx.id), { status: "cancelled" });

      // If it's a withdrawal request, cancel that document too
      if (tx.type === "debit" && tx.description?.startsWith("Penarikan")) {
        const wq = query(
          collection(db, "withdrawalRequests"),
          where("userId", "==", user!.uid),
          where("amount", "==", tx.amount),
          where("status", "==", "pending")
        );
        const wSnap = await getDocs(wq);
        await Promise.all(wSnap.docs.map(d => updateDoc(d.ref, { status: "cancelled" })));
      }

      toast.success("Transaksi berhasil dibatalkan.");
      setCancellingId(null);
      await fetchTransactions();
    } catch {
      toast.error("Gagal membatalkan transaksi. Coba lagi.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCloseTopUp = () => {
    setShowTopUp(false);
    setPaymentUrl(null);
    setTopUpAmount("");
    setTopUpPhone("");
    fetchTransactions();
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount < 50000) {
      toast.error("Minimum penarikan Rp 50.000");
      return;
    }
    if ((withdrawAmount as number) > totalBalance) {
      toast.error("Saldo tidak mencukupi");
      return;
    }
    if (!bankName || !accountNumber || !accountHolder) {
      toast.error("Lengkapi data rekening bank");
      return;
    }
    setWithdrawLoading(true);
    try {
      const ref = `WD-${Date.now().toString(36).toUpperCase()}`;

      await addDoc(collection(db, "transactions"), {
        userId: user!.uid,
        amount: withdrawAmount,
        type: "debit",
        description: `Penarikan ke ${bankName} · ${accountNumber}`,
        status: "pending",
        referenceId: ref,
        bankName,
        accountNumber,
        accountHolder,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "withdrawalRequests"), {
        userId: user!.uid,
        userName: userData?.name,
        userEmail: user!.email,
        amount: withdrawAmount,
        bankName,
        accountNumber,
        accountHolder,
        referenceId: ref,
        status: "pending",
        requestedAt: serverTimestamp(),
      });

      // Notify admin via email
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "bantu.idn@gmail.com",
          subject: `[BANTU] Permintaan Penarikan ${ref} — ${formatRp(withdrawAmount as number)}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:16px;">
              <h2 style="color:#0a1628;margin-bottom:4px;">Permintaan Penarikan Baru</h2>
              <p style="color:#6b7280;font-size:13px;margin-top:0;">Ref: <strong>${ref}</strong></p>
              <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:14px;">
                <tr><td style="padding:8px 0;color:#6b7280;">Nama</td><td style="padding:8px 0;font-weight:600;color:#0a1628;">${userData?.name ?? "-"}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;color:#0a1628;">${user!.email}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;">Jumlah</td><td style="padding:8px 0;font-weight:700;color:#006d38;font-size:16px;">${formatRp(withdrawAmount as number)}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;">Bank</td><td style="padding:8px 0;color:#0a1628;">${bankName}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;">No. Rekening</td><td style="padding:8px 0;color:#0a1628;">${accountNumber}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;">Atas Nama</td><td style="padding:8px 0;color:#0a1628;">${accountHolder}</td></tr>
              </table>
              <p style="margin-top:24px;font-size:12px;color:#9ca3af;">Proses melalui Mayar Dashboard dalam 1–2 hari kerja.</p>
            </div>
          `,
        }),
      });

      setWithdrawRef(ref);
      await fetchTransactions();
    } catch {
      toast.error("Gagal mengirim permintaan. Coba lagi.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleCloseWithdraw = () => {
    setShowWithdraw(false);
    setWithdrawRef(null);
    setWithdrawAmount("");
    setBankName("");
    setAccountNumber("");
    setAccountHolder("");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-brand-light font-sans items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light font-sans pt-28 pb-20 px-6">
      <Suspense fallback={null}>
        <TopUpSuccessHandler />
      </Suspense>
      <main className="max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-dark tracking-tight">{t("Wallet")}</h1>
            <p className="text-brand-dark/40 mt-2 text-lg font-sans font-light">
              {t("Kelola pendapatan, pengeluaran, dan saldo escrow Anda.")}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <button
              onClick={() => setShowWithdraw(true)}
              className="bg-white text-brand-dark font-display font-bold py-3 px-6 rounded-2xl text-[10px] uppercase tracking-widest shadow-ambient border border-brand-dark/5 hover:bg-brand-dark hover:text-white transition-all cursor-pointer"
            >
              {t("Tarik Saldo")}
            </button>
            <button
              onClick={() => setShowTopUp(true)}
              className="bg-brand-mid text-white font-display font-bold py-3 px-6 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand-mid/20 hover:bg-brand-dark transition-all cursor-pointer"
            >
              {t("Isi Saldo")}
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

          {/* Info Cards */}
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
                  {t("Dana Anda dipegang aman di escrow dan hanya dicairkan setelah proyek disetujui. Aman bagi UMKM, terjamin bagi Mahasiswa. (Biaya platform 2% berlaku).")}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 border border-brand-dark/5 shadow-ambient flex items-center gap-5 cursor-pointer hover:border-brand-mid/20 transition-all"
              onClick={() => setShowTopUp(true)}
            >
              <div>
                <h4 className="font-display font-bold text-sm text-brand-dark">{t("Top Up Mudah")}</h4>
                <p className="text-[11px] text-brand-dark/40 font-sans">Mendukung QRIS, Bank Transfer, dan E-Wallet via Mayar.</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Transaction History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History size={20} className="text-brand-mid" />
              <h2 className="text-2xl font-display font-bold text-brand-dark">Transaction History</h2>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border border-brand-dark/5 shadow-ambient">
              <div className="w-24 h-24 bg-brand-light/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-dark/5">
                <Wallet size={40} className="text-brand-dark/10" />
              </div>
              <h3 className="text-2xl font-display font-bold text-brand-dark mb-3">{t("Belum ada transaksi")}</h3>
              <p className="text-brand-dark/40 mb-10 font-sans font-light max-w-xs mx-auto">
                {userData?.role === "Mahasiswa"
                  ? t("Selesaikan tugas pertama Anda untuk melihat riwayat pembayaran di sini.")
                  : t("Posting proyek pertama Anda untuk memulai transaksi.")}
              </p>
              <Link
                href={userData?.role === "Mahasiswa" ? "/marketplace" : "/post-project"}
                className="inline-flex items-center gap-3 bg-brand-dark text-white font-display font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-brand-mid transition-all shadow-xl shadow-brand-dark/10"
              >
                {userData?.role === "Mahasiswa" ? t("Cari Proyek") : t("Posting Proyek")}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {transactions.map((tx, idx) => {
                  const isPending = tx.status === "pending";
                  const isCancelled = tx.status === "cancelled";
                  const isConfirming = cancellingId === tx.id;

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`bg-white rounded-[2rem] p-6 md:p-8 border shadow-ambient transition-all group ${
                        isCancelled
                          ? "border-brand-dark/5 opacity-50"
                          : isConfirming
                          ? "border-red-200"
                          : "border-brand-dark/5 hover:border-brand-mid/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-6">
                        {/* Left: icon + info */}
                        <div className="flex items-center gap-6 min-w-0">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                            isCancelled
                              ? "bg-brand-dark/5 text-brand-dark/20"
                              : tx.type === "credit"
                              ? "bg-brand-mid/10 text-brand-mid group-hover:bg-brand-mid group-hover:text-white"
                              : "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                          }`}>
                            {tx.type === "credit" ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-display font-bold text-base truncate transition-colors ${isCancelled ? "text-brand-dark/30 line-through" : "text-brand-dark group-hover:text-brand-mid"}`}>
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <p className="text-[10px] text-brand-dark/30 font-bold uppercase tracking-wider">
                                {tx.createdAt?.toDate
                                  ? formatDistanceToNow(tx.createdAt.toDate(), { addSuffix: true })
                                  : "Baru saja"}
                              </p>
                              <span className="w-1 h-1 rounded-full bg-brand-dark/10" />
                              <p className={`text-[10px] font-bold uppercase tracking-widest ${
                                tx.status === "completed" ? "text-brand-mid"
                                : tx.status === "cancelled" ? "text-brand-dark/30"
                                : "text-orange-500"
                              }`}>
                                {tx.status === "completed" ? "Completed"
                                  : tx.status === "cancelled" ? "Dibatalkan"
                                  : "Pending"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right: amount + actions */}
                        <div className="flex items-center gap-4 shrink-0">
                          {/* Inline cancel confirmation */}
                          <AnimatePresence mode="wait">
                            {isPending && isConfirming && (
                              <motion.div
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-2"
                              >
                                <span className="text-[10px] text-brand-dark/50 font-sans hidden sm:block">Batalkan?</span>
                                <button
                                  onClick={() => handleCancelTransaction(tx)}
                                  disabled={cancelLoading}
                                  className="flex items-center gap-1.5 bg-red-500 text-white font-display font-bold px-3.5 py-2 rounded-xl text-[9px] uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                  {cancelLoading ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                                  Ya
                                </button>
                                <button
                                  onClick={() => setCancellingId(null)}
                                  disabled={cancelLoading}
                                  className="flex items-center gap-1.5 bg-brand-light text-brand-dark/50 font-display font-bold px-3.5 py-2 rounded-xl text-[9px] uppercase tracking-widest hover:bg-brand-dark/10 transition-all border border-brand-dark/5"
                                >
                                  Tidak
                                </button>
                              </motion.div>
                            )}
                            {isPending && !isConfirming && (
                              <motion.button
                                key="cancel-btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setCancellingId(tx.id)}
                                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 hover:text-red-500 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
                              >
                                <XCircle size={12} /> Batal
                              </motion.button>
                            )}
                          </AnimatePresence>

                          <p className={`text-2xl font-display font-black tracking-tighter ${
                            isCancelled ? "text-brand-dark/20"
                            : tx.type === "credit" ? "text-brand-mid"
                            : "text-red-500"
                          }`}>
                            {tx.type === "credit" ? "+" : "-"}{formatRp(tx.amount)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>

      {/* ── Top Up Modal ── */}
      <AnimatePresence>
        {showTopUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm"
            onClick={handleCloseTopUp}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {/* ─── Step 1: Amount form ─── */}
                {!paymentUrl && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-10"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-display font-bold text-brand-dark">Isi Saldo</h2>
                      <button onClick={handleCloseTopUp} className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center hover:bg-brand-dark/10 transition-colors">
                        <X size={18} className="text-brand-dark/50" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mb-3">
                          Jumlah Top Up
                        </label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/40 font-display font-bold text-sm">Rp</span>
                          <input
                            type="number"
                            min={10000}
                            step={1000}
                            value={topUpAmount}
                            onChange={e => setTopUpAmount(e.target.value ? Number(e.target.value) : "")}
                            placeholder="0"
                            className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-2xl pl-12 pr-6 py-5 text-xl font-display font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {QUICK_AMOUNTS.map(amt => (
                            <button
                              key={amt}
                              onClick={() => setTopUpAmount(amt)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${topUpAmount === amt ? "bg-brand-mid text-white border-brand-mid" : "bg-brand-light border-brand-dark/5 text-brand-dark/50 hover:border-brand-mid/30"}`}
                            >
                              {formatRp(amt)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mb-3">
                          No. Telepon (untuk notifikasi)
                        </label>
                        <input
                          type="tel"
                          value={topUpPhone}
                          onChange={e => setTopUpPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all font-sans"
                        />
                      </div>

                      <button
                        onClick={handleTopUp}
                        disabled={topUpLoading || !topUpAmount || (topUpAmount as number) < 10000}
                        className="w-full flex items-center justify-center gap-3 bg-brand-mid text-white font-display font-bold py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-brand-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-mid/20"
                      >
                        {topUpLoading ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                        {topUpLoading ? "Membuat QR Code..." : "Tampilkan QR Pembayaran"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 2: Mayar payment page embedded ─── */}
                {paymentUrl && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Business tag header */}
                    <div className="bg-brand-dark px-7 py-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-mid flex items-center justify-center shrink-0">
                          <ShieldCheck size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-display font-bold text-sm leading-tight">BANTU Indonesia</p>
                          <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">Top Up Escrow Wallet</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-white/40 text-[8px] font-bold uppercase tracking-widest">Total</p>
                          <p className="text-brand-mid font-display font-black text-base leading-tight">{formatRp(topUpAmount as number)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
                          <button
                            onClick={() => setPaymentUrl(null)}
                            className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors py-1.5 px-2.5 rounded-lg hover:bg-white/10"
                          >
                            <RefreshCw size={10} /> Ganti
                          </button>
                          <button onClick={handleCloseTopUp} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <X size={13} className="text-white/60" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Embedded Mayar payment page */}
                    <div className="relative w-full" style={{ height: 560 }}>
                      <iframe
                        src={paymentUrl}
                        className="w-full h-full border-0"
                        title="Mayar Payment"
                        allow="payment"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                      />
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-brand-dark/5 flex items-center justify-between gap-3 bg-brand-light/40">
                      <a
                        href={paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-brand-dark/30 hover:text-brand-mid transition-colors"
                      >
                        <ExternalLink size={11} /> Buka di tab baru
                      </a>
                      <button
                        onClick={handleCloseTopUp}
                        className="flex items-center gap-2 bg-brand-mid text-white font-display font-bold px-5 py-2.5 rounded-xl text-[9px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-md shadow-brand-mid/20"
                      >
                        <CheckCircle2 size={13} /> Selesai Bayar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Withdraw Modal ── */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm"
            onClick={handleCloseWithdraw}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {/* ─── Step 1: Form ─── */}
                {!withdrawRef && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-10"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-display font-bold text-brand-dark">Tarik Saldo</h2>
                        <p className="text-[11px] text-brand-dark/40 font-sans mt-1">
                          Tersedia: <span className="font-bold text-brand-mid">{formatRp(totalBalance)}</span>
                        </p>
                      </div>
                      <button onClick={handleCloseWithdraw} className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center hover:bg-brand-dark/10 transition-colors">
                        <X size={18} className="text-brand-dark/50" />
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mb-3">Jumlah Penarikan</label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/40 font-display font-bold text-sm">Rp</span>
                          <input
                            type="number"
                            min={50000}
                            step={1000}
                            value={withdrawAmount}
                            onChange={e => setWithdrawAmount(e.target.value ? Number(e.target.value) : "")}
                            placeholder="0"
                            className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-2xl pl-12 pr-6 py-5 text-xl font-display font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mb-3">Bank</label>
                        <div className="relative">
                          <Building2 size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-dark/30" />
                          <input
                            type="text"
                            value={bankName}
                            onChange={e => setBankName(e.target.value)}
                            placeholder="BCA, Mandiri, BNI, BRI, dst."
                            className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all font-sans"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mb-3">Nomor Rekening</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={e => setAccountNumber(e.target.value)}
                          placeholder="Nomor rekening tujuan"
                          className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-dark/30 uppercase tracking-[0.2em] mb-3">Nama Pemilik Rekening</label>
                        <input
                          type="text"
                          value={accountHolder}
                          onChange={e => setAccountHolder(e.target.value)}
                          placeholder="Sesuai buku tabungan"
                          className="w-full bg-brand-light/50 border border-brand-dark/5 rounded-2xl px-6 py-4 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:bg-white transition-all font-sans"
                        />
                      </div>

                      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                        <p className="text-[11px] text-orange-600 font-sans leading-relaxed">
                          Penarikan diproses dalam 1–2 hari kerja. Minimum penarikan Rp 50.000.
                        </p>
                      </div>

                      <button
                        onClick={handleWithdraw}
                        disabled={withdrawLoading || !withdrawAmount || (withdrawAmount as number) < 50000 || !bankName || !accountNumber || !accountHolder}
                        className="w-full flex items-center justify-center gap-3 bg-brand-dark text-white font-display font-bold py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-brand-mid transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-brand-dark/10"
                      >
                        {withdrawLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                        {withdrawLoading ? "Memproses..." : "Ajukan Penarikan"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 2: Confirmation ─── */}
                {withdrawRef && (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-10 text-center"
                  >
                    <div className="w-20 h-20 bg-brand-mid/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={36} className="text-brand-mid" />
                    </div>

                    <h2 className="text-2xl font-display font-bold text-brand-dark mb-2">Permintaan Dikirim</h2>
                    <p className="text-sm text-brand-dark/40 font-sans mb-8">
                      Tim BANTU akan memproses penarikan Anda dalam 1–2 hari kerja.
                    </p>

                    <div className="bg-brand-light/60 rounded-2xl p-6 text-left space-y-3 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/30">Referensi</span>
                        <span className="font-display font-bold text-sm text-brand-dark tracking-wider">{withdrawRef}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-brand-dark/5 pt-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/30">Jumlah</span>
                        <span className="font-display font-bold text-base text-brand-mid">{formatRp(withdrawAmount as number)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-brand-dark/5 pt-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/30">Rekening</span>
                        <span className="text-sm font-sans text-brand-dark/70 text-right">{bankName} · {accountNumber}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-brand-dark/5 pt-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark/30">Atas Nama</span>
                        <span className="text-sm font-sans text-brand-dark/70">{accountHolder}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCloseWithdraw}
                      className="w-full bg-brand-dark text-white font-display font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-brand-mid transition-all shadow-xl shadow-brand-dark/10"
                    >
                      Selesai
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
