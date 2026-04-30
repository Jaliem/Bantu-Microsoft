"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Wallet, TrendingUp, CheckCircle2,  Star, ShieldCheck, ClipboardList, ArrowRight, User, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '@/lib/i18n';

export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [savedTasks, setSavedTasks] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Wait for auth to initialize
      if (authLoading) return;

      // 2. If no user, redirect to login
      if (!user) {
        router.push("/login");
        return;
      }

      // 3. If auth is finished but no userData found in Firestore
      if (!userData) {
        setLoading(false); // Stop showing the spinner
        return;
      }

      // 4. Check verification
      if (userData.verified !== true) {
        router.push("/login");
        toast.error("Please verify your email before accessing the dashboard.");
        return;
      }

      // 5. Fetch dashboard-specific data
      try {
        // Fetch Total Earnings from transactions
        const txQ = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          where("status", "==", "completed")
        );
        const txSnap = await getDocs(txQ);
        let total = 0;
        txSnap.forEach(doc => {
          const tx = doc.data();
          if (tx.type === "credit") total += tx.amount;
          else if (tx.type === "debit") total -= tx.amount;
        });
        setTotalEarnings(total);

        if (userData.role === 'UMKM') {
          const q = query(
            collection(db, "projects"),
            where("umkmId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(5)
          );
          const snap = await getDocs(q);
          const docs: any[] = [];
          snap.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
          setData(docs);
        } else {
          // For Mahasiswa: show recent available projects
          const q = query(
            collection(db, "projects"),
            orderBy("createdAt", "desc"),
            limit(4)
          );
          const snap = await getDocs(q);
          const docs: any[] = [];
          snap.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
          setData(docs);

          // Fetch saved tasks
          if (userData.savedProjects && userData.savedProjects.length > 0) {
            const savedIds = userData.savedProjects.slice(0, 10); // Firestore 'in' query limit is 10
            const savedQ = query(
              collection(db, "projects"),
              where(documentId(), "in", savedIds)
            );
            const savedSnap = await getDocs(savedQ);
            const sDocs: any[] = [];
            savedSnap.forEach(doc => sDocs.push({ id: doc.id, ...doc.data() }));
            setSavedTasks(sDocs);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, userData, authLoading, router]);

  if (loading) {
    return (
      <div className="bg-brand-light min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-brand-light font-sans text-brand-dark min-h-screen pt-28 pb-20 px-6">
      <main className="max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-brand-dark mb-3">
              Halo, {userData?.name?.split(' ')[0] || 'User'}!
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            
            <Link href="/profile" className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-ambient border border-brand-dark/5 hover:border-brand-mid/30 transition-all group">
              <div className="w-10 h-10 bg-brand-dark rounded-xl overflow-hidden flex items-center justify-center text-white font-display font-bold shadow-lg">
                {userData?.avatarUrl ? <img src={userData.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : userData?.name?.[0] || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold font-display text-brand-dark mb-0.5">{userData?.name}</p>
                <p className="text-[9px] font-bold text-brand-dark/30 uppercase tracking-widest">{userData?.role}</p>
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column - Stats & Saved */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-brand-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-mid/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{userData?.role === 'UMKM' ? 'Escrow Balance' : 'Total Earnings'}</p>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-brand-mid backdrop-blur-md border border-white/10">
                    <Wallet size={24} />
                  </div>
                </div>
                <h2 className="text-4xl font-display font-black tracking-tight mb-4">
                  Rp {totalEarnings.toLocaleString("id-ID")}
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-mid uppercase tracking-widest">
                  <TrendingUp size={14} />
                  Verified on Live Ledger
                </div>
                
                <Link href="/wallet" className="mt-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                  Go to Wallet <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>

            {userData?.role !== 'UMKM' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-ambient border border-brand-dark/5"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Saved Tasks</h3>
                  <Bookmark size={18} className="text-brand-mid" />
                </div>
                
                <div className="space-y-4">
                  {savedTasks.length > 0 ? (
                    savedTasks.slice(0, 3).map((task) => (
                      <Link key={`saved-side-${task.id}`} href={`/marketplace/${task.id}`} className="block group">
                        <div className="p-4 rounded-2xl bg-brand-light/30 border border-transparent group-hover:border-brand-mid/20 transition-all">
                          <p className="text-[9px] font-bold text-brand-mid uppercase tracking-wider mb-1">{task.category}</p>
                          <h4 className="text-sm font-display font-bold text-brand-dark line-clamp-1 group-hover:text-brand-mid transition-colors">{task.title}</h4>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest">No saved tasks</p>
                    </div>
                  )}
                  
                  {savedTasks.length > 3 && (
                    <p className="text-center text-[9px] font-bold text-brand-dark/20 uppercase tracking-widest pt-2">
                      + {savedTasks.length - 3} more in marketplace
                    </p>
                  )}
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-10">
            
            <div>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl font-display font-bold text-brand-dark tracking-tight">
                  {userData?.role === 'UMKM' ? 'My Active Posts' : 'Recommended Tasks'}
                </h2>
                <Link href={userData?.role === 'UMKM' ? "/dashboard/my-posts" : "/marketplace"} className="text-[10px] font-bold uppercase tracking-widest text-brand-mid hover:text-brand-dark transition-all">
                  {t("Lihat Semua")}
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {data.length > 0 ? (
                    data.map((task, idx) => (
                      <motion.div 
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (idx * 0.1) }}
                      >
                        <Link href={`/marketplace/${task.id}`} className="block group h-full">
                          <div className="bg-white rounded-[2rem] p-8 shadow-ambient border border-brand-dark/5 flex flex-col h-full hover:border-brand-mid/30 hover:shadow-lg transition-all">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="bg-brand-mid/10 text-brand-mid text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                {task.category}
                              </span>
                            </div>
                            <h3 className="font-display font-bold text-brand-dark text-lg mb-4 group-hover:text-brand-mid transition-colors line-clamp-2">
                              {task.title}
                            </h3>
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-brand-dark/5">
                              <span className="font-display font-bold text-brand-dark text-sm">{task.budget}</span>
                              <span className="text-[10px] text-brand-dark/30 font-bold uppercase tracking-widest">
                                {task.createdAt?.toDate ? formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true }) : 'Baru saja'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 bg-white rounded-[2.5rem] p-16 text-center border border-brand-dark/5 shadow-ambient">
                      <div className="w-20 h-20 bg-brand-light flex items-center justify-center rounded-3xl mx-auto mb-6">
                        <ClipboardList className="text-brand-dark/10" size={40} />
                      </div>
                      <p className="text-brand-dark/40 font-display font-bold uppercase tracking-widest text-xs mb-8">
                        {userData?.role === 'UMKM' ? "No projects posted yet" : "No tasks found"}
                      </p>
                      {userData?.role === 'UMKM' && (
                        <Link href="/post-project" className="bg-brand-dark text-white font-display font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-brand-mid transition-all shadow-xl shadow-brand-dark/10">
                          Post a Project
                        </Link>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
