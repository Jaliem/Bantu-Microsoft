"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Bell, Wallet, TrendingUp, CheckCircle2, Sparkles, Star, ShieldCheck, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      if (!userData) return;

      if (userData.verified !== true) {
        router.push("/login");
        toast.error("Please verify your email before accessing the dashboard.");
        return;
      }

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
          const q = query(
            collection(db, "projects"),
            orderBy("createdAt", "desc"),
            limit(4)
          );
          const snap = await getDocs(q);
          const docs: any[] = [];
          snap.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
          setData(docs);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, userData, router]);

  if (loading) {
    return (
      <div className="bg-[#f8f9fe] flex font-sans text-gray-900 w-full h-full flex-1">
        <Sidebar />
        <main className="flex-1 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-[#008f4c] border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fe] flex font-sans text-gray-900 w-full h-full flex-1">
      <Sidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
              Halo, {userData?.name || 'User'}! {userData?.role === 'UMKM' ? 'Siap kembangkan bisnismu?' : 'Siap cari pengalaman hari ini?'}
            </h1>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#16a34a] px-3 py-1 rounded-full text-xs font-bold uppercase">
                <CheckCircle2 size={14} /> Verified {userData?.role}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center relative hover:bg-gray-50 transition-colors cursor-pointer">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm">
              <div className="w-10 h-10 bg-[#111827] rounded-full overflow-hidden flex items-center justify-center text-white font-bold">
                {userData?.avatarUrl ? <img src={userData.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : userData?.name?.[0] || 'U'}
              </div>
              <div>
                <p className="text-sm font-bold leading-none mb-1">{userData?.name}</p>
                <p className="text-[10px] text-gray-500 leading-none">{userData?.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Stats */}
          <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
            
            <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-sm font-bold text-gray-500">{userData?.role === 'UMKM' ? 'Total Spent' : 'Monthly Earnings'}</h3>
                <div className="w-10 h-10 rounded-xl bg-[#e6f4ea] text-[#008f4c] flex items-center justify-center">
                  <Wallet size={20} />
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900 mb-3">
                {userData?.totalEarnings
                  ? `Rp ${userData.totalEarnings.toLocaleString("id-ID")}`
                  : "Rp 0"}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#16a34a]">
                <TrendingUp size={16} />
                {userData?.totalEarnings ? "Total Earned" : "New Account"}
              </div>
            </div>

            {userData?.role !== 'UMKM' && (
              <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-500">Rank & Portfolio Score</h3>
                  <RankBadge rank={userData?.rank || 'D'} />
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-black text-gray-900">{userData?.completedTasks || 0}</span>
                  <span className="text-sm text-gray-400 mb-1">tasks completed</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#008f4c] rounded-full transition-all duration-700"
                    style={{ width: `${getRankProgress(userData?.completedTasks || 0, userData?.rank || 'D')}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {getRankNextStep(userData?.rank || 'D', userData?.completedTasks || 0)}
                </p>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-6">
            
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                {userData?.role === 'UMKM' ? 'My Active Posts' : 'Recommended Tasks'}
              </h2>
              <Link href={userData?.role === 'UMKM' ? "/dashboard/my-posts" : "/marketplace"} className="text-sm font-bold text-[#008f4c] hover:text-[#007a41] transition-colors cursor-pointer">
                Lihat Semua
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.length > 0 ? (
                data.map((task) => (
                  <Link href={`/marketplace/${task.id}`} key={task.id} className="block group cursor-pointer h-full">
                    <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100 flex flex-col h-full hover:border-[#008f4c] transition-colors">
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-[#f8f9fe] text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                            {task.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-[#008f4c] transition-colors line-clamp-2">{task.title}</h3>
                        <div className="flex items-center justify-between mt-auto pt-4">
                          <span className="font-bold text-gray-900">{task.budget}</span>
                          <span className="text-xs text-gray-500 font-medium">{task.createdAt?.toDate ? formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true }) : 'Baru saja'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-2 bg-white rounded-[32px] p-8 text-center border border-gray-100">
                  <ClipboardList className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500">
                    {userData?.role === 'UMKM' ? "You haven't posted any projects yet." : "No tasks found."}
                  </p>
                  {userData?.role === 'UMKM' && (
                    <Link href="/post-project" className="inline-block mt-4 bg-[#008f4c] text-white px-6 py-2 rounded-full font-bold cursor-pointer">
                      Post a Project
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#f0f2ff] rounded-[32px] p-8 mt-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-[#008f4c] flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Tips Meningkatkan Rank</h3>
                  <p className="text-sm text-gray-500">Lengkapi portofolio videografi kamu untuk mencapai Rank S!</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white px-5 py-3 rounded-full flex items-center gap-3 shadow-sm border border-gray-100">
                  <div className="bg-[#dcfce7] text-[#16a34a] p-1 rounded-full"><CheckCircle2 size={14} /></div>
                  <span className="text-sm font-bold text-gray-700">Respon cepat (avg &lt; 30m)</span>
                </div>
                <div className="bg-white px-5 py-3 rounded-full flex items-center gap-3 shadow-sm border border-gray-100">
                  <div className="bg-[#dcfce7] text-[#16a34a] p-1 rounded-full"><Star size={14} fill="currentColor" /></div>
                  <span className="text-sm font-bold text-gray-700">Rating konsisten 4.8+</span>
                </div>
                <div className="bg-white px-5 py-3 rounded-full flex items-center gap-3 shadow-sm border border-gray-100">
                  <div className="bg-[#dcfce7] text-[#16a34a] p-1 rounded-full"><ShieldCheck size={14} /></div>
                  <span className="text-sm font-bold text-gray-700">Verified Identity</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function RankBadge({ rank }: { rank: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    S: { color: "text-yellow-700", bg: "bg-yellow-100" },
    A: { color: "text-green-700", bg: "bg-green-100" },
    B: { color: "text-blue-700", bg: "bg-blue-100" },
    C: { color: "text-orange-700", bg: "bg-orange-100" },
    D: { color: "text-gray-600", bg: "bg-gray-100" },
  };
  const { color, bg } = config[rank] || config.D;
  return (
    <span className={`font-black text-2xl w-10 h-10 rounded-xl flex items-center justify-center ${color} ${bg}`}>
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
  if (rank === "A") return `${30 - completed} more tasks + 4.8 avg rating to reach Rank S`;
  if (rank === "B") return `${15 - completed} more tasks to reach Rank A`;
  if (rank === "C") return `${5 - completed} more tasks to reach Rank B`;
  return "Complete your first task to reach Rank C!";
}
