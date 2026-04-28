"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock, Wallet, MapPin, CheckCircle2, ShieldCheck, Sparkles, ChevronRight, Share2, Bookmark, Star } from 'lucide-react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { userData, user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [similarProjects, setSimilarProjects] = useState<any[]>([]);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchProjectAndSimilar = async () => {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const projectData: any = { id: docSnap.id, ...docSnap.data() };
          setProject(projectData);
          
          if (projectData.category) {
            const q = query(
              collection(db, "projects"),
              where("category", "==", projectData.category),
              limit(3)
            );
            const querySnapshot = await getDocs(q);
            const similarData: any[] = [];
            querySnapshot.forEach((d) => {
              if (d.id !== id) {
                similarData.push({ id: d.id, ...d.data() });
              }
            });
            setSimilarProjects(similarData);
          }
        } else {
          console.error("No such project!");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectAndSimilar();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-brand-light flex flex-col font-sans text-brand-dark w-full h-screen">
        <div className="flex-1 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-brand-mid border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-brand-light flex flex-col font-sans text-brand-dark w-full h-screen">
        <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
          <h1 className="text-3xl font-display font-bold text-brand-dark mb-4">Project Not Found</h1>
          <Link href="/marketplace" className="bg-brand-mid text-white px-8 py-3 rounded-full font-display font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-mid/20 hover:bg-brand-dark transition-all">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const handleApply = async () => {
    if (!userData || !user) {
      toast.error("You must be logged in to apply.");
      router.push("/login");
      return;
    }
    
    setApplying(true);
    try {
      if (project.umkmId) {
        const umkmDoc = await getDoc(doc(db, "users", project.umkmId));
        if (umkmDoc.exists()) {
          const umkmData = umkmDoc.data();
          if (umkmData.email) {
            await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: umkmData.email,
                subject: `New Application for ${project.title} 🚀`,
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <div style="background: linear-gradient(135deg, #006d38 0%, #00aa5b 100%); padding: 40px 32px; text-align: center; border-radius: 0 0 32px 32px;">
                      <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0; letter-spacing: -0.5px;">BANTU</h1>
                    </div>
                    <div style="padding: 40px 32px;">
                      <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 22px;">Hello ${umkmData.name || 'UMKM'}! 🎉</h2>
                      <p>New application received for ${project.title}.</p>
                    </div>
                  </div>
                `
              })
            });
          }
        }
      }
      toast.success("Successfully applied for this project!");
    } catch (error) {
      console.error("Failed to send application", error);
      toast.error("Applied, but failed to send email notification.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-brand-light flex flex-col font-sans text-brand-dark w-full min-h-screen">
      <main className="flex-grow pt-28 pb-20 px-6 max-w-7xl mx-auto w-full">
        <Link href="/marketplace" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30 hover:text-brand-mid transition-all mb-10 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Job Details */}
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-ambient border border-brand-dark/5"
            >
              <div className="flex flex-wrap gap-3 mb-10">
                <span className="bg-brand-mid/10 text-brand-mid text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.15em]">{project.category}</span>
                <span className="bg-brand-dark/5 text-brand-dark/40 text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.15em]">{project.skill || 'INTERMEDIATE'}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-brand-dark leading-[1.1] mb-12">
                {project.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-brand-dark/5 mb-12">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-light/50 flex items-center justify-center text-brand-mid shadow-sm">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.2em] text-brand-dark/20 uppercase mb-1">Posted</p>
                    <p className="font-display font-bold text-brand-dark text-sm">
                      {project.createdAt?.toDate ? formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-light/50 flex items-center justify-center text-brand-mid shadow-sm">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.2em] text-brand-dark/20 uppercase mb-1">Budget</p>
                    <p className="font-display font-bold text-brand-dark text-sm">{project.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-light/50 flex items-center justify-center text-brand-mid shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.2em] text-brand-dark/20 uppercase mb-1">Location</p>
                    <p className="font-display font-bold text-brand-dark text-sm">Remote (Indonesia)</p>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-2xl font-display font-bold mb-6 text-brand-dark">Project Description</h3>
                <div className="prose prose-brand max-w-none text-brand-dark/60 font-sans leading-relaxed">
                  <ReactMarkdown>
                    {project.description}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-2xl font-display font-bold mb-6 text-brand-dark">Deliverables</h3>
                <ul className="space-y-5">
                  {[
                    "Logo utama dalam format Scalable Vector Graphics (SVG)",
                    "High-resolution PNG dengan latar belakang transparan",
                    "Brand Style Guide (Typography, Color Palette, Logo Usage)",
                    "Mockup sederhana untuk gelas kertas dan kemasan kopi"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="mt-1 bg-brand-mid/10 p-1 rounded-full">
                        <CheckCircle2 size={16} className="text-brand-mid shrink-0" />
                      </div>
                      <span className="text-brand-dark/70 font-sans leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2.5rem] overflow-hidden bg-brand-light aspect-video relative shadow-ambient border border-brand-dark/5">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/10 to-transparent z-10" />
                <div className="w-full h-full bg-brand-dark/5 flex items-center justify-center">
                  <span className="font-display font-bold text-brand-dark/10 text-4xl tracking-tighter uppercase">Project Preview</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Apply actions */}
          <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-8">
            
            {/* AI Matching Engine Card */}
            <div className="bg-brand-mid rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                  <Sparkles size={16} /> AI MATCHING ENGINE
                </div>
                <div className="text-7xl font-display font-black tracking-tighter mb-4">98%</div>
                <p className="text-white/80 text-sm leading-relaxed mb-8 font-light">
                  Highly Recommended based on your verified skills in Creative Design.
                </p>
                <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-white rounded-full" 
                  />
                </div>
              </div>
            </div>

            {/* UMKM Profile Card */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-ambient border border-brand-dark/5">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-20 h-20 rounded-[1.5rem] bg-brand-light flex items-center justify-center text-3xl shadow-sm border border-brand-dark/5">
                  ☕
                </div>
                <div>
                  <h3 className="font-display font-bold text-brand-dark text-xl leading-tight">Warung Kopi Jaya</h3>
                  <div className="inline-flex items-center gap-2 bg-brand-mid/10 text-brand-mid px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mt-2">
                    <CheckCircle2 size={12} /> Verified UMKM
                  </div>
                </div>
              </div>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-dark/40 font-bold uppercase tracking-tighter text-[10px]">Member Since</span>
                  <span className="font-display font-bold text-brand-dark">Oct 2022</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-dark/40 font-bold uppercase tracking-tighter text-[10px]">Rating</span>
                  <span className="font-display font-bold text-brand-dark flex items-center gap-1.5">4.9 <Star size={14} className="fill-brand-mid text-brand-mid" /></span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-dark/40 font-bold uppercase tracking-tighter text-[10px]">Projects Completed</span>
                  <span className="font-display font-bold text-brand-dark">12</span>
                </div>
              </div>

              {userData?.role !== 'UMKM' ? (
                <button 
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-brand-mid hover:bg-brand-dark text-white font-display font-bold py-5 rounded-[1.25rem] text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-brand-mid/20 hover:-translate-y-0.5 active:translate-y-0 mb-4 cursor-pointer disabled:opacity-70 disabled:translate-y-0"
                >
                  {applying ? "Applying..." : "Apply for this Task"}
                </button>
              ) : (
                <div className="bg-brand-light/50 text-brand-dark/30 font-display font-bold py-5 rounded-[1.25rem] text-[10px] uppercase tracking-[0.2em] text-center mb-4">
                  UMKM cannot apply
                </div>
              )}
              
              <div className="flex items-center justify-center gap-4 mt-6">
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark transition-colors">
                  <Share2 size={14} /> Share
                </button>
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 hover:text-brand-dark transition-colors">
                  <Bookmark size={14} /> Save
                </button>
              </div>
            </div>

            {/* BANTU Secure Payments */}
            <div className="bg-white rounded-[2rem] p-8 border border-brand-dark/5 shadow-ambient flex gap-5">
              <div className="w-12 h-12 bg-brand-mid/10 rounded-2xl flex items-center justify-center text-brand-mid shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-brand-dark mb-1">BANTU Secure Payments</h4>
                <p className="text-[11px] text-brand-dark/40 leading-relaxed font-sans">
                  Funds are held in escrow and only released when the project is approved.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Similar Opportunities */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-display font-bold text-brand-dark tracking-tight">Similar Opportunities</h2>
            <Link href="/marketplace" className="text-[10px] font-bold uppercase tracking-widest text-brand-mid hover:text-brand-dark transition-colors">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProjects.length > 0 ? (
              similarProjects.map((simProj) => (
                <Link href={`/marketplace/${simProj.id}`} key={simProj.id} className="block group cursor-pointer">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-brand-dark/5 hover:border-brand-mid/20 hover:shadow-ambient transition-all h-full">
                    <span className="bg-brand-light text-brand-dark/50 text-[9px] font-bold px-4 py-2 rounded-full inline-block mb-6 uppercase tracking-wider">{simProj.category}</span>
                    <h4 className="text-xl font-display font-bold text-brand-dark group-hover:text-brand-mid transition-colors mb-6 line-clamp-2">
                      {simProj.title}
                    </h4>
                    <div className="flex justify-between items-center mt-auto pt-6 border-t border-brand-dark/5">
                      <span className="font-display font-bold text-brand-dark text-sm">{simProj.budget}</span>
                      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-dark/20 group-hover:bg-brand-mid group-hover:text-white group-hover:translate-x-1 transition-all">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-brand-dark/30 font-display font-bold uppercase tracking-widest py-10 col-span-3 text-center border-2 border-dashed border-brand-dark/5 rounded-[2.5rem]">No similar projects found</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
