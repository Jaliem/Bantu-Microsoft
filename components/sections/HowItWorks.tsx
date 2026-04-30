"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LaptopMockup } from "../ui/LaptopMockup";
import { mockups } from "@/lib/mockups";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const steps = [
	{
		id: 1,
		title: "UMKM Posting Tugas",
		desc: "Pemilik bisnis mengunggah judul tugas, kategori dan experience level yang dibutuhkan.",
		image: mockups.howItWorks.step1,
		label: "UMKM memposting tugas di BANTU",
	},
	{
		id: 2,
		title: "Deskripsi Instan via AI",
		desc: "AI BANTU menyusun SOP dan rincian tugas secara profesional secara otomatis untuk memastikan hasil kerja yang jelas. ",
		image: mockups.howItWorks.step2,
		label: "AI menyusun deskripsi tugas secara otomatis",
	},
	{
		id: 3,
		title: "Bidding & Pendaftaran",
		desc: "Mahasiswa meninjau marketplace dan mengajukan penawaran harga (bid) yang kompetitif untuk tugas tersebut.",
		image: mockups.howItWorks.step3,
		label: "Mahasiswa melakukan bidding pada tugas",
	},
	{
		id: 4,
		title: "Seleksi & Chat Langsung",
		desc: "UMKM meninjau profil pelamar dan bisa berdiskusi langsung melalui fitur chat sebelum memilih mahasiswa terbaik.",
		image: mockups.howItWorks.step4,
		label: "UMKM melakukan seleksi dan chat dengan pelamar",
	},
	{
		id: 5,
		title: "Review Kualitas via AI",
		desc: "Sebelum mahasiswa mengirim hasil kerja, AI kami memberikan feedback instan untuk memastikan kualitas sesuai standar.",
		image: mockups.howItWorks.step5,
		label: "AI mereview kualitas hasil kerja mahasiswa",
	},
	{
		id: 6,
		title: "Persetujuan UMKM",
		desc: "UMKM menerima hasil kerja, meninjau deliverables, dan memberikan persetujuan akhir.",
		image: mockups.howItWorks.step6,
		label: "UMKM menyetujui hasil kerja mahasiswa",
	},
	{
		id: 7,
		title: "Pembayaran Otomatis",
		desc: "Setelah disetujui, dana yang tertahan di sistem escrow langsung dicairkan ke wallet mahasiswa.",
		image: mockups.howItWorks.step7,
		label: "Pembayaran otomatis ke wallet mahasiswa",
	},
	{
		id: 8,
		title: "Update Portofolio",
		desc: "Riwayat kerja mahasiswa diperbarui secara otomatis dengan bukti kerja nyata yang diverifikasi platform.",
		image: mockups.howItWorks.step8,
		label: "Portofolio mahasiswa diperbarui otomatis",
	},
];

export function HowItWorks() {
	const [activeStep, setActiveStep] = useState(0);

	return (
		<section className="bg-brand-light text-brand-dark relative">
			<div className="container mx-auto px-6 py-32">
				<div className="text-center mb-20">
					<h2 className="text-[clamp(2.4rem,4.5vw,4.4rem)] font-semibold tracking-[-0.03em] leading-[1.05] text-brand-dark font-display mb-6 text-balance">
						{t("Cara Kerjanya")}
					</h2>
					<p className="text-lg md:text-xl text-brand-dark/80 max-w-3xl mx-auto leading-relaxed text-balance">
						{t("Proses yang mulus dengan bantuan AI, dari posting hingga pembayaran.")}
					</p>
				</div>

				<div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative items-start">
					{/* Scrollable Steps Content */}
					<div className="w-full lg:w-1/2 relative z-10">
						{steps.map((step, index) => (
							<motion.div
								key={step.id}
								onViewportEnter={() => setActiveStep(index)}
								viewport={{ margin: "-50% 0px -50% 0px" }}
								className={cn(
									"min-h-[50vh] flex flex-col justify-center transition-opacity duration-500",
									activeStep === index ? "opacity-100" : "opacity-30"
								)}
							>
								<div className="text-brand-dark/80 font-sans text-xs sm:text-sm mb-4 font-semibold tracking-[0.22em] uppercase">
									{t("Langkah")} 0{step.id}
								</div>
								<h3 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight mb-4 font-display text-brand-dark text-balance">
									{t(step.title)}
								</h3>
								<p className="text-lg md:text-2xl text-brand-dark/80 leading-relaxed max-w-xl text-balance">
									{t(step.desc)}
								</p>
							</motion.div>
						))}
					</div>

					{/* Sticky Laptop Mockup */}
					<div className="w-full lg:w-1/2 lg:sticky lg:top-32 h-[50vh] lg:h-[80vh] flex items-center justify-center">
						<div className="w-full max-w-xl transition-all duration-500">
							<LaptopMockup
								label={steps[activeStep].label}
								image={steps[activeStep].image}
								tilt="none"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
