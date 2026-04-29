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

export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [savedTasks, setSavedTasks] = useState<any[]>([]);
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
          
          {/* Left Column - Stats */}
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
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{userData?.role === 'UMKM' ? 'Total Spent' : 'Total Earnings'}</p>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-brand-mid backdrop-blur-md border border-white/10">
                    <Wallet size={24} />
                  </div>
                </div>
                <h2 className="text-4xl font-display font-black tracking-tight mb-4">
                  {userData?.totalEarnings
                    ? `Rp ${userData.totalEarnings.toLocaleString("id-ID")}`
                    : "Rp 0"}
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
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">Career Rank</h3>
                  <RankBadge rank={userData?.rank || 'D'} />
                </div>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-5xl font-display font-black text-brand-dark tracking-tighter">{userData?.completedTasks || 0}</span>
                  <span className="text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest mb-2">tasks completed</span>
                </div>
                <div className="w-full h-2.5 bg-brand-light rounded-full overflow-hidden mb-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getRankProgress(userData?.completedTasks || 0, userData?.rank || 'D')}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-brand-mid rounded-full shadow-lg shadow-brand-mid/20"
                  />
                </div>
                <p className="text-[11px] text-brand-dark/50 font-sans leading-relaxed">
                  {getRankNextStep(userData?.rank || 'D', userData?.completedTasks || 0)}
                </p>
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
                  Lihat Semua
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

            {userData?.role !== 'UMKM' && (
              <div>
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-2xl font-display font-bold text-brand-dark tracking-tight">
                    Saved Tasks
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {savedTasks.length > 0 ? (
                      savedTasks.map((task, idx) => (
                        <motion.div 
                          key={`saved-${task.id}`}
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
                      <div className="col-span-2 bg-white rounded-[2.5rem] p-12 text-center border border-brand-dark/5 shadow-ambient">
                        <div className="w-16 h-16 bg-brand-light flex items-center justify-center rounded-2xl mx-auto mb-5">
                          <Bookmark className="text-brand-dark/10" size={32} />
                        </div>
                        <p className="text-brand-dark/40 font-display font-bold uppercase tracking-widest text-xs">
                          No saved tasks yet
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

function RankBadge({ rank }: { rank: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    S: { color: "text-brand-mid", bg: "bg-brand-mid/10" },
    A: { color: "text-brand-mid/80", bg: "bg-brand-mid/5" },
    B: { color: "text-brand-dark/60", bg: "bg-brand-light" },
    C: { color: "text-brand-dark/40", bg: "bg-brand-light" },
    D: { color: "text-brand-dark/30", bg: "bg-brand-light" },
  };
  const { color, bg } = config[rank] || config.D;
  return (
    <span className={`font-display font-black text-2xl w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-brand-dark/5 ${color} ${bg}`}>
      {rank}
    </span>
  );
}

function getRankProgress(completed: number, rank: string): number {
  if (rank === "S") return 100;
  if (rank === "A") return Math.min(99, 50 + (completed - 15) * 2);
  if (rank === "B") return Math.min(49, 20 + (completed - 5) * 3);
  if (rank === "C") return Math.min(19, completed * 4);
  return Math.min(5, completed);
}

function getRankNextStep(rank: string, completed: number): string {
  if (rank === "S") return "Maximum rank achieved. You are a BANTU legend!";
  if (rank === "A") return `${30 - completed} more tasks to reach Rank S`;
  if (rank === "B") return `${15 - completed} more tasks to reach Rank A`;
  if (rank === "C") return `${5 - completed} more tasks to reach Rank B`;
  return "Complete your first task to reach Rank C!";
}
