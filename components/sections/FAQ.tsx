"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const faqs = [
	{
		question: "Bagaimana cara kerja sistem bidding?",
		answer: "Mahasiswa dapat mengajukan penawaran harga (bid) untuk tugas yang diposting UMKM. UMKM kemudian meninjau profil, portofolio, dan harga yang ditawarkan sebelum memilih mahasiswa terbaik untuk proyek tersebut.",
	},
	{
		question: "Apakah AI benar-benar meninjau hasil kerja?",
		answer: "Ya, AI kami menganalisis teks dan gambar hasil pekerjaan mahasiswa berdasarkan SOP yang ada. Fitur ini memberikan feedback instan untuk memastikan kualitas terbaik sebelum diserahkan kepada UMKM.",
	},
	{
		question: "Berapa lama proses pencairan dana?",
		answer: "Setelah UMKM menyetujui pekerjaan, dana dari sistem escrow akan langsung masuk ke wallet mahasiswa. Mahasiswa kemudian dapat menarik saldo tersebut ke rekening bank pribadi mereka.",
	},
	{
		question: "Apakah ada biaya platform untuk mahasiswa?",
		answer: "BANTU mengenakan biaya platform sebesar 2% untuk setiap transaksi yang berhasil. Biaya ini digunakan untuk memelihara sistem escrow yang aman dan fitur pendukung AI kami.",
	},
];

export function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<section className="py-32 bg-brand-mid overflow-hidden relative text-brand-light">
			<div className="container mx-auto px-6 max-w-5xl relative z-10">
				<div className="grid lg:grid-cols-3 gap-20">
					<div className="lg:col-span-1">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							className="inline-flex items-center px-4 py-1.5 rounded-full border border-brand-light/20 bg-white/10 backdrop-blur-md text-brand-light font-medium text-xs tracking-widest uppercase mb-8"
						>
							Bantuan
						</motion.div>
						<h2 className="text-4xl md:text-5xl font-medium tracking-tight text-brand-light font-display mb-6">
							Pertanyaan Umum.
						</h2>
						<p className="text-brand-light/70 leading-relaxed mb-10 font-light">
							Semua yang perlu Anda ketahui tentang memulai proyek pertama Anda di
							BANTU.
						</p>

						<div className="pt-10 border-t border-brand-light/10">
							<p className="text-sm font-display font-bold uppercase tracking-widest text-brand-mid brightness-150 mb-4">Punya pertanyaan lain?</p>
							<p className="text-brand-light/50 text-sm font-sans leading-relaxed">
								Email kami di <a href="mailto:bantu.idn@gmail.com" className="text-brand-light hover:underline">bantu.idn@gmail.com</a> atau tanyakan langsung pada <strong>chatbot</strong> kami di pojok kanan bawah.
							</p>
						</div>
					</div>

					<div className="lg:col-span-2 space-y-4">
						{faqs.map((faq, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className={cn(
									"rounded-3xl transition-all duration-500 overflow-hidden border",
									openIndex === index
										? "bg-white/10 border-brand-light/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
										: "bg-transparent border-transparent hover:bg-white/5"
								)}
							>
								<button
									onClick={() =>
										setOpenIndex(openIndex === index ? null : index)
									}
									className="w-full px-8 py-8 text-left flex items-center justify-between gap-6"
								>
									<span
										className={cn(
											"font-medium text-lg md:text-xl transition-colors",
											openIndex === index
												? "text-brand-light"
												: "text-brand-light/80"
										)}
									>
										{faq.question}
									</span>
									<div
										className={cn(
											"w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border text-xl leading-none",
											openIndex === index
												? "bg-brand-light text-brand-mid border-brand-light rotate-180"
												: "bg-transparent text-brand-light/40 border-brand-light/20"
										)}
									>
										{openIndex === index ? "−" : "+"}
									</div>
								</button>
								<AnimatePresence>
									{openIndex === index && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.3 }}
										>
											<div className="px-8 pb-8 pt-2 text-brand-light/70 leading-relaxed font-light">
												{faq.answer}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
