"use client";

import { motion } from "framer-motion";
import { LaptopMockup } from "../ui/LaptopMockup";
import { mockups } from "@/lib/mockups";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const features = [
	{
		title: "Pasar Tugas (Bidding)",
		desc: "Mahasiswa dapat mengajukan penawaran harga (bid) terbaik mereka untuk tugas yang diposting oleh UMKM, menciptakan pasar yang kompetitif dan adil.",
		label: "Placeholder: Marketplace Screen",
		image: mockups.marketplace,
	},
	{
		title: "Pembuat CV Otomatis",
		desc: "Setiap riwayat tugas yang berhasil diselesaikan secara otomatis dikonversi menjadi entri CV profesional yang terverifikasi dan siap cetak (ATS-friendly).",
		label: "Placeholder: Portfolio Builder Screen",
		image: mockups.portfolioBuilder,
	},
	{
		title: "Quality Review via AI",
		desc: "AI canggih kami meninjau hasil kerja mahasiswa sebelum diserahkan ke UMKM, memastikan standar kualitas terpenuhi melalui analisis visual dan teks.",
		label: "Placeholder: AI Quality Screen",
		image: mockups.howItWorks.step5,
	},
	{
		title: "Chat & Diskusi Terpadu",
		desc: "Komunikasi langsung antara UMKM dan mahasiswa melalui platform untuk koordinasi proyek, revisi, dan negosiasi yang lebih efisien.",
		label: "Placeholder: Chat Screen",
		image: mockups.taskHistory,
	},
	{
		title: "Pembayaran Escrow Aman",
		desc: "Dana dikunci di awal oleh BANTU dan hanya dicairkan ketika UMKM memberikan persetujuan, menjamin keamanan transaksi bagi kedua belah pihak.",
		label: "Placeholder: Escrow Payment Screen",
		image: mockups.escrow,
	},
];

export function CoreFeatures() {
	return (
		<section className="py-32 bg-brand-mid text-brand-light">
			<div className="container mx-auto px-6">
				<div className="text-center mb-24">
					<h2 className="text-[clamp(2.4rem,4.5vw,4.4rem)] font-medium tracking-tight leading-[1.05] text-brand-light font-display mb-6 text-balance">
						{t("Fitur Utama")}
					</h2>
					<p className="text-lg md:text-xl text-brand-light/80 max-w-3xl mx-auto leading-relaxed text-balance font-light">
						{t("Semua yang Anda butuhkan untuk mengelola tugas mikro dengan aman dan membangun portofolio yang dapat diverifikasi.")}
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
											{t(feature.title)}
										</h3>
										<p className="text-lg md:text-xl text-brand-light/80 leading-relaxed max-w-2xl text-balance font-light">
											{t(feature.desc)}
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
