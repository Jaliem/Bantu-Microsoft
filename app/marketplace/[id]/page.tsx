"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock, Wallet, MapPin, CheckCircle2, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
          const projectData = { id: docSnap.id, ...docSnap.data() };
          setProject(projectData);
          
          // Fetch similar projects
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
      <div className="bg-[#f8f9fe] flex flex-col font-sans text-gray-900 w-full h-full flex-1">
        <div className="flex-1 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-[#008f4c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-[#f8f9fe] flex flex-col font-sans text-gray-900 w-full h-full flex-1">
        <div className="flex-1 flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Link href="/marketplace" className="text-[#008f4c] font-bold">Return to Marketplace</Link>
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
      // Fetch UMKM user email to send notification
      if (project.umkmId) {
        const umkmDoc = await getDoc(doc(db, "users", project.umkmId));
        if (umkmDoc.exists()) {
          const umkmData = umkmDoc.data();
          if (umkmData.email) {
            // Send email to UMKM
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
                      <p style="color: rgba(255,255,255,0.8); font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0;">New Application Received</p>
                    </div>
                    <div style="padding: 40px 32px;">
                      <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 22px;">Hello ${umkmData.name || 'UMKM'}! 🎉</h2>
                      <p style="font-size: 15px; line-height: 1.7; color: #4b5563; margin: 0 0 24px 0;">
                        Great news! A talented Mahasiswa has just applied to your project. Here are the details:
                      </p>
                      <div style="background-color: #f8f9fe; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Applicant</td>
                            <td style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 700; text-align: right;">${userData.name}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 600; border-top: 1px solid #e5e7eb;">Project</td>
                            <td style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 700; text-align: right; border-top: 1px solid #e5e7eb;">${project.title}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 600; border-top: 1px solid #e5e7eb;">Budget</td>
                            <td style="padding: 8px 0; font-size: 13px; color: #006d38; font-weight: 700; text-align: right; border-top: 1px solid #e5e7eb;">${project.budget}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: 600; border-top: 1px solid #e5e7eb;">Category</td>
                            <td style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 700; text-align: right; border-top: 1px solid #e5e7eb;">${project.category}</td>
                          </tr>
                        </table>
                      </div>
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="https://bantu.com/dashboard/my-posts" style="background: linear-gradient(135deg, #006d38, #00aa5b); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 16px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(0,143,76,0.3);">Review Application</a>
                      </div>
                      <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">Respond promptly to attract the best talent!</p>
                    </div>
                    <div style="border-top: 1px solid #f3f4f6; padding: 24px 32px; text-align: center;">
                      <p style="font-size: 10px; font-weight: 700; color: #9ca3af; letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">© 2024 BANTU INDONESIA • KARYA ANAK BANGSA</p>
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
    <div className="bg-[#f8f9fe] flex flex-col font-sans text-gray-900 w-full h-full flex-1">
      <main className="flex-grow pt-24 pb-16 px-6 max-w-7xl mx-auto w-full">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#008f4c] transition-colors mb-8 group cursor-pointer">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Job Details */}
          <div className="flex-1 bg-white rounded-[32px] p-8 md:p-12 shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
            <div className="flex gap-2 mb-6">
              <span className="bg-[#e6f4ea] text-[#008f4c] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">{project.category}</span>
              <span className="bg-[#fff0f0] text-[#e04343] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">{project.skill || 'INTERMEDIATE'}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#111827] leading-tight mb-10">
              {project.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-gray-100 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f8f9fe] flex items-center justify-center text-[#008f4c]">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Posted</p>
                  <p className="font-bold text-gray-900">
                    {project.createdAt?.toDate ? formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f8f9fe] flex items-center justify-center text-[#008f4c]">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Budget</p>
                  <p className="font-bold text-gray-900">{project.budget}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f8f9fe] flex items-center justify-center text-[#008f4c]">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Location</p>
                  <p className="font-bold text-gray-900">Remote (Indonesia)</p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Project Description & SOP</h3>
              <div className="prose prose-sm md:prose-base prose-green max-w-none text-gray-600">
                <ReactMarkdown>
                  {project.description}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Deliverables</h3>
              <ul className="space-y-4">
                {[
                  "Logo utama dalam format Scalable Vector Graphics (SVG)",
                  "High-resolution PNG dengan latar belakang transparan",
                  "Brand Style Guide (Typography, Color Palette, Logo Usage)",
                  "Mockup sederhana untuk gelas kertas dan kemasan kopi"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-[#008f4c] shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] overflow-hidden bg-gray-100 aspect-video relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
              {/* Using a placeholder visual that matches the vibe since we don't have the exact image asset */}
              <div className="w-full h-full bg-[#3d2c20] flex items-center justify-center">
                <div className="w-32 h-48 bg-[#d4a373] rounded-t-xl opacity-80" />
              </div>
            </div>
          </div>

          {/* Right Column - Apply actions */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
            
            {/* AI Matching Engine Card */}
            <div className="bg-gradient-to-br from-[#00b050] to-[#008f4c] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/90 text-xs font-bold tracking-widest uppercase mb-4">
                  <Sparkles size={14} /> AI MATCHING ENGINE
                </div>
                <div className="text-6xl font-black tracking-tighter mb-2">98%</div>
                <p className="text-white/90 text-sm leading-relaxed mb-6">
                  Highly Recommended for your skills in Brand Identity & SVG Illustration.
                </p>
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div className="w-[98%] h-full bg-white rounded-full" />
                </div>
              </div>
            </div>

            {/* UMKM Profile Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-[#f0f2ff] flex items-center justify-center text-2xl">
                  👨‍🍳
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Warung Kopi Jaya</h3>
                  <div className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#16a34a] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1">
                    <CheckCircle2 size={10} /> Verified UMKM
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-bold text-gray-900">Oct 2022</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1">4.9 <span className="text-yellow-400">★</span></span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Projects Completed</span>
                  <span className="font-bold text-gray-900">12</span>
                </div>
              </div>

              {userData?.role !== 'UMKM' ? (
                <button 
                  onClick={handleApply}
                  className="w-full bg-[#008f4c] hover:bg-[#007a41] text-white font-bold py-4 rounded-2xl transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)] hover:-translate-y-0.5 active:translate-y-0 mb-4 cursor-pointer"
                >
                  Apply for this Task
                </button>
              ) : (
                <div className="bg-gray-50 text-gray-500 font-medium py-4 rounded-2xl text-center mb-4 text-sm">
                  UMKM cannot apply
                </div>
              )}
              
              <p className="text-center text-xs text-gray-400">
                Average response time: 2 hours
              </p>
            </div>

            {/* BANTU Secure Payments */}
            <div className="bg-[#f8f9fe] rounded-[24px] p-6 border border-gray-100 flex gap-4">
              <ShieldCheck className="text-[#008f4c] shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">BANTU Secure Payments</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Funds are held in escrow and only released when the project is approved.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Similar Opportunities */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProjects.length > 0 ? (
              similarProjects.map((simProj) => (
                <Link href={`/marketplace/${simProj.id}`} key={simProj.id} className="block group cursor-pointer">
                  <div className="bg-white p-6 rounded-[24px] border border-gray-100 hover:border-[#008f4c] hover:shadow-[0_8px_30px_rgba(19,27,46,0.06)] transition-all h-full">
                    <span className="bg-[#f8f9fe] text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-full inline-block mb-4">{simProj.category}</span>
                    <h4 className="font-bold text-gray-900 group-hover:text-[#008f4c] transition-colors mb-4 text-lg line-clamp-2">
                      {simProj.title}
                    </h4>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-sm font-bold text-gray-900">{simProj.budget}</span>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-[#008f4c] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 col-span-3">No similar projects found in this category.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
