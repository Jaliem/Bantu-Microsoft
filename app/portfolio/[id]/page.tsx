import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, ArrowRight, Star } from 'lucide-react';

export default function PortfolioPage() {
  return (
    <div className="bg-[#f8f9fe] flex flex-col font-sans text-gray-900 w-full h-full flex-1">
      <main className="flex-grow pt-24 pb-16 px-6 max-w-6xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 mb-16 relative">
          
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#16a34a] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
              <CheckCircle2 size={12} /> VERIFIED STUDENT TALENT
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#111827] leading-[1.1] mb-2">
              Budi Santoso
            </h1>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#008f4c] leading-[1.1] mb-6">
              Mahasiswa UI
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed max-w-lg mb-8">
              Creative problem solver specializing in digital design and strategic copywriting. Helping local UMKM scale their brand presence through precise visual storytelling.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button className="bg-[#008f4c] hover:bg-[#007a41] text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-[0_4px_14px_rgba(0,143,76,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                <Download size={18} /> Download CV / Portfolio PDF
              </button>
              <button className="bg-[#f0f2ff] text-[#006d38] font-bold py-3.5 px-8 rounded-full hover:bg-[#e4e7ff] transition-all">
                Hire Budi
              </button>
            </div>
          </div>

          <div className="w-full md:w-[450px] shrink-0 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#e4e7ff] to-transparent rounded-[48px] rotate-3 scale-105 opacity-50" />
            <div className="relative rounded-[48px] overflow-hidden bg-gradient-to-br from-[#f0f2ff] to-[#e4e7ff] aspect-square flex items-end justify-center shadow-2xl border border-white/50 pt-10">
              {/* Fallback image representing the illustrated portrait */}
              <div className="w-4/5 h-[90%] bg-[#111827] rounded-t-[100px] flex items-center justify-center text-white relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-32 bg-gray-800 rounded-t-full" />
                <span className="text-5xl font-black relative z-10 opacity-20">BUDI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
            <div className="text-4xl font-black text-gray-900 mb-2">25</div>
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">TASKS COMPLETED</div>
          </div>
          <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
            <div className="text-4xl font-black text-gray-900 mb-2 flex items-center justify-center gap-2">
              4.9 <Star className="text-[#008f4c]" fill="currentColor" size={28} />
            </div>
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">CLIENT RATING</div>
          </div>
          <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100">
            <div className="text-4xl font-black text-gray-900 mb-2">UI</div>
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">UNIVERSITAS INDONESIA</div>
          </div>
        </div>

        {/* Core Competencies */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-0.5 w-8 bg-[#008f4c]" />
            <h3 className="text-xl font-bold text-gray-900">Core Competencies</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { name: "Adobe Illustrator", icon: "🎨" },
              { name: "Copywriting", icon: "✍️" },
              { name: "Excel", icon: "📊" },
              { name: "Premiere Pro", icon: "🎬" }
            ].map(skill => (
              <div key={skill.name} className="flex items-center gap-2 bg-[#f0f2ff] px-4 py-2.5 rounded-xl border border-white shadow-sm">
                <span>{skill.icon}</span>
                <span className="text-sm font-bold text-gray-700">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proof of Work */}
        <div className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Proof of Work</h2>
              <p className="text-gray-500">Curated selection of recent client projects and academic excellence.</p>
            </div>
            <Link href="#" className="hidden md:flex items-center gap-2 text-sm font-bold text-[#008f4c] hover:text-[#006d38] transition-colors">
              View All Projects <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { tag: "Logo Design", title: "Kopi Senja Branding", desc: "Complete visual identity system for an independent roastery in Depok." },
              { tag: "Video Production", title: "UMKM Spotlight Series", desc: "Edited a 6-part social media series highlighting local artisans." },
              { tag: "Copywriting", title: "SaaS Landing Page", desc: "Conversion-focused copy for a local edutech startup." }
            ].map((work, idx) => (
              <div key={idx} className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100 group cursor-pointer hover:-translate-y-1 transition-transform">
                <div className="aspect-video bg-[#111827] relative overflow-hidden">
                  {/* Decorative backgrounds to simulate portfolio images */}
                  <div className="absolute inset-0 opacity-50 group-hover:scale-105 transition-transform duration-700">
                    {idx === 0 && <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900 to-[#111827]" />}
                    {idx === 1 && <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 to-[#111827]" />}
                    {idx === 2 && <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900 to-[#111827]" />}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {idx === 0 && <span className="text-6xl text-amber-500 font-serif italic">L</span>}
                    {idx === 1 && <span className="w-16 h-10 border-4 border-blue-400 rounded-md" />}
                    {idx === 2 && <div className="w-12 h-16 bg-white/10 rounded" />}
                  </div>
                </div>
                <div className="p-6">
                  <span className="inline-block bg-[#e6f4ea] text-[#008f4c] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-3">
                    {work.tag}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{work.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{work.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-[#00b050] to-[#008f4c] rounded-[40px] p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to start a project?</h2>
            <p className="text-white/90 text-lg max-w-xl mx-auto mb-10">
              I'm currently available for freelance design and writing opportunities. Let's build something great together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button className="bg-white text-[#008f4c] font-bold py-4 px-8 rounded-full hover:bg-gray-50 transition-colors shadow-lg">
                Send a Message
              </button>
              <button className="bg-transparent border-2 border-white/30 hover:border-white text-white font-bold py-4 px-8 rounded-full transition-colors">
                View BANTU Profile
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
