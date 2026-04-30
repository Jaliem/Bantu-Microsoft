"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/i18n";

export function CTA() {
  return (
    <section className="py-32 bg-brand-light text-brand-dark overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs sm:text-sm font-semibold tracking-[0.24em] uppercase text-brand-dark/80 mb-4"
          >
            {t("Mulai Hari Ini")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2.8rem,6vw,5.75rem)] font-semibold tracking-[-0.04em] leading-[0.98] font-display mb-8 text-balance text-brand-dark"
          >
            {t("Siap Menjembatani Kesenjangan?")}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-brand-dark/80 mb-12 max-w-3xl mx-auto leading-relaxed text-balance"
          >
            {t("Bergabunglah dengan ribuan mahasiswa yang sedang membangun karier mereka, dan UMKM yang mempercepat pertumbuhan mereka bersama BANTU.")}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
          >
            <Link 
              href="/marketplace" 
              className="h-14 px-8 rounded-full bg-brand-mid text-white font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-brand-mid/90 transition-colors w-full sm:w-auto text-lg cursor-pointer"
            >
              {t("Mulai Secara Gratis")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
