import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Target, ShieldCheck, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-[#f8f9fe] flex flex-col font-sans text-gray-900 w-full h-full flex-1">
      <main className="flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 bg-[#dcfce7] text-[#16a34a] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Heart size={14} className="fill-current" /> TENTANG KAMI
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#111827] leading-tight mb-8">
            Memberdayakan <span className="text-[#008f4c]">Generasi Muda</span> & UMKM Indonesia.
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            BANTU adalah platform yang menghubungkan mahasiswa berbakat dengan UMKM lokal, menciptakan ekosistem kolaboratif di mana pengalaman nyata bertemu dengan pertumbuhan bisnis.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-white rounded-[40px] p-12 shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#e6f4ea] rounded-3xl flex items-center justify-center text-[#008f4c] mb-8">
              <Target size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visi Kami</h2>
            <p className="text-gray-600 leading-relaxed">
              Menjadi jembatan utama yang mempercepat digitalisasi UMKM Indonesia sekaligus memberikan ruang portofolio profesional pertama bagi setiap mahasiswa di tanah air.
            </p>
          </div>
          <div className="bg-white rounded-[40px] p-12 shadow-[0_4px_24px_rgba(19,27,46,0.03)] border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#f0f2ff] rounded-3xl flex items-center justify-center text-[#4a72ff] mb-8">
              <Users size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Misi Kami</h2>
            <p className="text-gray-600 leading-relaxed">
              Menyediakan platform yang aman, terpercaya, dan mudah digunakan untuk memfasilitasi pertukaran nilai yang adil antara talenta muda dan pelaku usaha kecil menengah.
            </p>
          </div>
        </div>

        {/* Why Choose Bantu */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Mengapa Memilih BANTU?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Kami merancang setiap fitur untuk memastikan pengalaman yang menguntungkan bagi kedua belah pihak.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck size={28} />, title: "Pembayaran Aman", desc: "Sistem escrow kami memastikan dana aman sampai pekerjaan selesai dan disetujui." },
              { icon: <Users size={28} />, title: "Talenta Terverifikasi", desc: "Setiap mahasiswa melalui proses verifikasi identitas dan institusi pendidikan." },
              { icon: <Target size={28} />, title: "Matchmaking AI", desc: "Algoritma cerdas yang mempertemukan kebutuhan spesifik UMKM dengan keahlian mahasiswa." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-[#f8f9fe] rounded-2xl flex items-center justify-center text-[#008f4c] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-[#1e2336] to-[#0f111a] rounded-[48px] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#008f4c]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4a72ff]/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Mulai Perjalananmu Bersama Kami</h2>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10">
              Bergabunglah dengan ribuan mahasiswa dan UMKM yang sudah berkolaborasi dan tumbuh bersama melalui platform BANTU.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" className="bg-[#00ff88] hover:bg-[#00e67a] text-[#006d38] font-bold py-4 px-10 rounded-full transition-all shadow-lg flex items-center justify-center gap-2">
                Daftar Sekarang <ArrowRight size={20} />
              </Link>
              <Link href="/marketplace" className="bg-transparent border-2 border-white/20 hover:border-white text-white font-bold py-4 px-10 rounded-full transition-colors flex items-center justify-center">
                Jelajahi Proyek
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
