"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle2, Download, ArrowRight, Star, Loader2, Trophy, MessageSquare, MapPin, Phone, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProjectEntry {
  id: string;
  title: string;
  category: string;
  budget: string;
  description: string;
  createdAt: any;
  status?: string;
}

interface Review {
  id: string;
  studentName: string;
  projectTitle: string;
  umkmRating: number;
  umkmReview: string;
  umkmRatedAt: any;
}

interface UMKMProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  role?: string;
  avgRating?: number;
  createdAt?: any;
}

const categoryIcon: Record<string, string> = {
  "Design": "🎨",
  "Writing": "✍️",
  "Data": "📊",
  "Video": "🎬",
  "Marketing": "📣",
  "Admin": "📋",
  "Tech": "💻",
};

export default function UMKMProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, userData } = useAuth();
  const [profile, setProfile] = useState<UMKMProfile | null>(null);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchUMKMData = async () => {
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UMKMProfile);
        }

        // Fetch projects posted by this UMKM
        const q = query(
          collection(db, "projects"),
          where("umkmId", "==", id),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const projectList: ProjectEntry[] = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as ProjectEntry));
        setProjects(projectList);

        // Fetch reviews for this UMKM
        const reviewsQ = query(
          collection(db, "applications"),
          where("umkmId", "==", id),
          where("umkmRating", ">", 0)
        );
        const reviewsSnap = await getDocs(reviewsQ);
        const reviewList: Review[] = reviewsSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            studentName: data.studentName,
            projectTitle: data.projectTitle,
            umkmRating: data.umkmRating,
            umkmReview: data.umkmReview,
            umkmRatedAt: data.umkmRatedAt,
          };
        });
        setReviews(reviewList.sort((a, b) => (b.umkmRatedAt?.seconds || 0) - (a.umkmRatedAt?.seconds || 0)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUMKMData();
  }, [id]);

  const handleChat = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk menghubungi UMKM.");
      router.push("/login");
      return;
    }

    if (user.uid === id) {
      toast.error("Anda tidak dapat mengirim pesan ke diri sendiri.");
      return;
    }

    setChatLoading(true);
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", user.uid)
      );
      const querySnapshot = await getDocs(q);

      let existingChatId = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(id)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        router.push(`/chat?id=${existingChatId}`);
      } else {
        // Create new chat
        const newChatRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, id],
          name: profile?.name || "User",
          avatar: profile?.avatarUrl || "",
          lastMessage: "Halo, saya tertarik dengan profil UMKM Anda.",
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        // Add initial message
        await addDoc(collection(db, "chats", newChatRef.id, "messages"), {
          text: "Halo, saya tertarik dengan profil UMKM Anda.",
          senderId: user.uid,
          senderName: userData?.name || user.displayName || "User",
          createdAt: serverTimestamp()
        });

        router.push(`/chat?id=${newChatRef.id}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Gagal memulai percakapan.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleDownload = () => {
    const originalTitle = document.title;
    document.title = ""; // Clears the page title from the print header
    window.print();
    document.title = originalTitle;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-brand-dark font-display">Profil UMKM tidak ditemukan</h1>
        <Link href="/marketplace" className="text-brand-mid font-bold">Kembali ke Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col font-sans text-brand-dark w-full min-h-screen selection:bg-brand-mid/20 selection:text-brand-mid print:min-h-0 print:bg-white">
      <main className="flex-grow pt-32 pb-24 px-6 max-w-7xl mx-auto w-full relative print:hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-1/2 bg-radial from-brand-mid/5 to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-16 mb-24 relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 z-10 text-center lg:text-left"
          >
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
              <div className="inline-flex items-center gap-1.5 bg-brand-mid/10 text-brand-mid px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                <CheckCircle2 size={12} /> Verified UMKM Partner
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] text-brand-dark leading-[0.95] font-display mb-4 text-balance">
              {profile.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-4 gap-x-8 mb-8">
              {profile.location && (
                <div className="flex items-center gap-2 text-brand-dark/40 font-sans font-medium text-sm uppercase tracking-widest">
                  <MapPin size={16} className="text-brand-mid" />
                  {profile.location}
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 text-brand-dark/40 font-sans font-medium text-sm uppercase tracking-widest">
                  <Phone size={16} className="text-brand-mid" />
                  {profile.phone}
                </div>
              )}
            </div>

            <p className="text-brand-dark/70 text-lg md:text-xl leading-relaxed max-w-2xl mb-12 font-light text-balance mx-auto lg:mx-0">
              {profile.bio || "Dedicated UMKM partner focused on growth and community impact through collaboration with talented students."}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={handleDownload}
                className="h-14 px-8 rounded-full bg-brand-mid text-white font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-brand-mid/90 transition-all shadow-lg shadow-brand-mid/20 hover:-translate-y-0.5 cursor-pointer"
              >
                <Download size={18} /> Download Profile
              </button>
              <button 
                onClick={handleChat}
                disabled={chatLoading}
                className="h-14 px-8 rounded-full bg-transparent border border-brand-dark/20 text-brand-dark font-semibold tracking-wide flex items-center justify-center hover:bg-brand-dark/5 transition-all cursor-pointer disabled:opacity-50"
              >
                {chatLoading ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} className="mr-2" />}
                Hubungi {profile.name.split(" ")[0]}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[420px] shrink-0 relative"
          >
            <div className="absolute inset-0 bg-brand-mid/20 rounded-[4rem] rotate-6 scale-105 opacity-50 blur-2xl" />
            <div className="relative rounded-[3.5rem] overflow-hidden bg-white aspect-square flex items-center justify-center shadow-ambient border border-brand-dark/5">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-mid flex items-center justify-center">
                  <span className="text-[140px] font-bold text-white/20 select-none font-display">
                    {profile.name[0]}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {[
            { label: "Projects Posted", value: projects.length, icon: <Briefcase className="text-brand-mid" size={24} /> },
            { 
              label: "Average Rating", 
              value: profile.avgRating ? profile.avgRating.toFixed(1) : "—", 
              icon: <Star className="text-brand-mid" fill="currentColor" size={24} /> 
            }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2.5rem] p-10 text-center shadow-ambient border border-brand-dark/5 flex flex-col items-center justify-center"
            >
              <div className="text-5xl font-semibold tracking-tight font-display mb-2 flex items-center gap-2 text-brand-dark">
                {stat.value}
                {stat.icon}
              </div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-brand-dark/40 uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Focus Areas / Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-brand-dark/10" />
              <h3 className="text-xl font-semibold text-brand-dark font-display uppercase tracking-[0.2em]">Business Focus Areas</h3>
              <div className="h-px flex-1 bg-brand-dark/10" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {profile.skills.map(skill => (
                <div key={skill} className="flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-brand-dark/5 shadow-sm hover:border-brand-mid transition-colors cursor-default">
                  <span className="text-sm font-semibold text-brand-dark/80">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mb-32">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                Client Feedback
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-brand-dark font-display mb-4">Reviews & Testimonials</h2>
              <p className="text-brand-dark/50 max-w-2xl mx-auto leading-relaxed font-light">
                Apa kata mahasiswa yang telah bekerja sama dengan {profile.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((rev, index) => (
                <motion.div 
                  key={rev.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[2.5rem] p-10 shadow-ambient border border-brand-dark/5 flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-mid/10 rounded-full flex items-center justify-center text-brand-mid font-bold">
                        {rev.studentName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-brand-dark text-sm">{rev.studentName}</div>
                        <div className="text-[10px] text-brand-dark/30 font-bold uppercase tracking-widest">Student Talent</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={14} 
                          className={star <= rev.umkmRating ? "text-yellow-400 fill-yellow-400" : "text-brand-dark/10"} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className="flex-grow">
                    <p className="text-brand-dark/70 text-lg leading-relaxed font-light italic mb-8">
                      "{rev.umkmReview || "Sangat senang bisa berkontribusi dalam proyek ini. Komunikasi lancar dan instruksi sangat jelas."}"
                    </p>
                  </blockquote>

                  <div className="pt-8 border-t border-brand-dark/5">
                    <div className="text-[10px] font-bold text-brand-dark/20 uppercase tracking-widest mb-1">Project</div>
                    <div className="text-xs font-semibold text-brand-dark/60">{rev.projectTitle}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Project History Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              Published Projects
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-brand-dark font-display mb-4">Project History</h2>
            <p className="text-brand-dark/50 max-w-2xl mx-auto leading-relaxed font-light">
              Daftar proyek yang telah dipublikasikan oleh {profile.name} di platform BANTU.
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-24 text-center border border-brand-dark/5 shadow-ambient">
              <div className="w-20 h-20 bg-brand-dark/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-dark/20">
                <Briefcase size={40} />
              </div>
              <p className="text-brand-dark/40 font-medium">Belum ada proyek yang dipublikasikan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div 
                  key={project.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-ambient border border-brand-dark/5 group cursor-pointer hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-block bg-brand-mid/10 text-brand-mid text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {project.category}
                      </span>
                      <span className="text-[10px] font-bold text-brand-mid uppercase">
                        {project.budget}
                      </span>
                    </div>
                    <h3 className="font-semibold text-brand-dark text-xl mb-3 font-display leading-tight line-clamp-2">{project.title}</h3>
                    
                    <p className="text-sm text-brand-dark/60 leading-relaxed line-clamp-3 mb-6 font-light">{project.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-brand-dark/30 uppercase tracking-widest pt-6 border-t border-brand-dark/5">
                      <span>{project.createdAt?.toDate ? formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true }) : ""}</span>
                      <Link href={`/marketplace/${project.id}`} className="text-brand-mid hover:underline">Lihat Detail</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-mid rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-mid/30"
        >
          {/* Background Patterns */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:32px_32px]" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight font-display mb-6 text-balance leading-[1.05]">Ingin berkolaborasi?</h2>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light text-balance">
              Hubungi {profile.name.split(" ")[0]} untuk mendiskusikan peluang kerja sama atau proyek UMKM lainnya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={handleChat}
                className="h-16 px-10 bg-white text-brand-mid font-semibold rounded-full hover:bg-brand-light transition-all shadow-xl flex items-center gap-2 justify-center text-lg"
              >
                Kirim Pesan <MessageSquare size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Printable Version */}
      <div className="hidden print:block bg-white text-black font-serif w-full">
        <style dangerouslySetInnerHTML={{ __html: `
          @page { size: auto; margin: 0mm; }
          @media print {
            body { background: white !important; margin: 0 !important; }
            header, footer, nav { display: none !important; }
            .hidden.print\\:block { 
              display: block !important; 
              padding: 20mm 15mm !important;
            }
          }
        `}} />
        
        <div className="border-b-2 border-black pb-6 mb-8">
          <div className="text-4xl font-bold mb-2">{profile.name}</div>
          <div className="text-sm font-bold">
            {profile.location && <span>{profile.location}</span>}
            {profile.phone && <span> • {profile.phone}</span>}
            {profile.email && <span> • {profile.email}</span>}
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold uppercase border-b border-black mb-4">Business Profile</h2>
          <p className="text-sm leading-relaxed italic">
            {profile.bio || "Dedicated UMKM partner focused on growth and community impact through collaboration with talented students."}
          </p>
        </section>

        {profile.skills && profile.skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold uppercase border-b border-black mb-4">Focus Areas</h2>
            <div className="text-sm">
              {profile.skills.join(", ")}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-bold uppercase border-b border-black mb-4">Published Projects (Via BANTU Platform)</h2>
          <div className="space-y-8">
            {projects.map((project) => (
              <div key={project.id} className="page-break-inside-avoid">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-bold underline">{project.title}</h3>
                  <span className="text-sm font-bold">
                    {project.createdAt?.toDate ? new Date(project.createdAt.toDate()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : ""}
                  </span>
                </div>
                <div className="flex gap-4 text-xs font-bold uppercase mb-2">
                  <span>Category: {project.category}</span>
                  <span>•</span>
                  <span>Budget: {project.budget}</span>
                </div>
                <p className="text-sm leading-relaxed mb-2">
                  {project.description}
                </p>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm italic text-gray-500 underline">No projects published yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
