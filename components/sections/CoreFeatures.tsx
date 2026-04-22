"use client";

import { motion } from "framer-motion";
import { LaptopMockup } from "../ui/LaptopMockup";
import { mockups } from "@/lib/mockups";
import { cn } from "@/lib/utils";

const features = [
	{
		title: "Pasar Tugas (Bounty)",
		desc: "Pusat terpadu di mana UMKM memposting tugas mikro dan mahasiswa mencari peluang yang sesuai dengan keahlian dan jadwal mereka.",
		label: "Placeholder: Marketplace Screen",
		image: mockups.marketplace,
	},
	{
		title: "Pembayaran Escrow Pintar",
		desc: "Dana dikunci di awal dan hanya dicairkan ketika tugas disetujui. Jaminan pembayaran untuk mahasiswa, jaminan hasil kerja untuk UMKM.",
		label: "Placeholder: Escrow Payment Screen",
		image: mockups.escrow,
	},
	{
		title: "Sistem Peringkat Terverifikasi",
		desc: "Mahasiswa membangun reputasi melalui tugas yang berhasil. Peringkat yang lebih tinggi membuka tugas dengan bayaran lebih baik dan peluang eksklusif.",
		label: "Placeholder: Student Rank Screen",
		image: mockups.studentRank,
	},
	{
		title: "Pembuat Portofolio Instan",
		desc: "Setiap tugas yang diselesaikan secara otomatis membuat entri portofolio yang terverifikasi, lengkap dengan ulasan UMKM dan metrik proyek.",
		label: "Placeholder: Portfolio Builder Screen",
		image: mockups.portfolioBuilder,
	},
	{
		title: "Buku Besar / Riwayat Tugas Terkini",
		desc: "Transparansi penuh untuk kedua belah pihak. Lacak progres tugas, riwayat pembayaran, dan penyelesaian sengketa dalam satu catatan terpadu.",
		label: "Placeholder: Task History Screen",
		image: mockups.taskHistory,
	},
];

export function CoreFeatures() {
	return (
		<section className="py-32 bg-brand-mid text-brand-light">
			<div className="container mx-auto px-6">
				<div className="text-center mb-24">
					<h2 className="text-[clamp(2.4rem,4.5vw,4.4rem)] font-medium tracking-tight leading-[1.05] text-brand-light font-display mb-6 text-balance">
						Fitur Utama
					</h2>
					<p className="text-lg md:text-xl text-brand-light/80 max-w-3xl mx-auto leading-relaxed text-balance font-light">
						Semua yang Anda butuhkan untuk mengelola tugas mikro dengan aman dan
						membangun portofolio yang dapat diverifikasi.
					</p>
				</div>

				<div className="flex flex-col gap-32">
					{features.map((feature, index) => {
						const isEven = index % 2 === 0;
						return (
							<div
								key={index}
								className={cn(
									"flex flex-col gap-12 lg:gap-20 items-center",
									isEven ? "lg:flex-row" : "lg:flex-row-reverse"
								)}
							>
								<div className="w-full lg:w-1/2 flex flex-col justify-center">
									<motion.div
										initial={{ opacity: 0, x: isEven ? -30 : 30 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6 }}
									>
										<h3 className="text-3xl md:text-4xl font-medium tracking-tight leading-tight mb-6 font-display text-brand-light text-balance brightness-150">
											{feature.title}
										</h3>
										<p className="text-lg md:text-xl text-brand-light/80 leading-relaxed max-w-2xl text-balance font-light">
											{feature.desc}
										</p>
									</motion.div>
								</div>

								<div className="w-full lg:w-1/2">
									<motion.div
										initial={{ opacity: 0, x: isEven ? 30 : -30 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6, delay: 0.2 }}
									>
										<LaptopMockup
											label={feature.label}
											image={feature.image}
											tilt={isEven ? "left" : "right"}
										/>
									</motion.div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
