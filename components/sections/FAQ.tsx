"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const faqs = [
	{
		question: "Bagaimana kualitas pekerjaan dijamin?",
		answer: "Setiap tugas mengikuti SOP yang dihasilkan AI. Pengiriman akhir diverifikasi oleh Gerbang Kualitas AI kami sebelum dikirimkan kepada Anda, memastikannya memenuhi semua persyaratan.",
	},
	{
		question: "Bagaimana sistem pembayaran escrow bekerja?",
		answer: "Saat Anda mempekerjakan seorang mahasiswa, dana disimpan secara aman oleh BANTU. Pembayaran hanya diteruskan kepada mahasiswa setelah Anda meninjau dan menyetujui pekerjaannya.",
	},
	{
		question: "Bisakah saya mempekerjakan mahasiswa untuk pekerjaan jangka panjang?",
		answer: "Tentu saja! Banyak bisnis menggunakan BANTU untuk menguji bakat melalui tugas mikro sebelum menawarkan posisi paruh waktu atau magang kepada mereka.",
	},
	{
		question: "Apakah ada ukuran tugas minimum?",
		answer: "Tidak. Anda dapat memposting apa saja mulai dari tugas entri data 1 jam hingga proyek manajemen media sosial selama sebulan.",
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
						<p className="text-brand-light/70 leading-relaxed mb-8 font-light">
							Semua yang perlu Anda ketahui tentang memulai proyek pertama Anda di
							BANTU.
						</p>
						<button className="text-brand-light font-medium flex items-center group transition-colors hover:text-brand-light/80">
							Lihat semua dokumentasi
							<span className="ml-2 group-hover:translate-x-1 transition-transform">
								&rarr;
							</span>
						</button>
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
