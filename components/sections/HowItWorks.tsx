"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LaptopMockup } from "../ui/LaptopMockup";
import { mockups } from "@/lib/mockups";
import { cn } from "@/lib/utils";

const steps = [
	{
		id: 1,
		title: "Posting Tugas",
		desc: "UMKM mengunggah ringkasan singkat tentang apa yang perlu dikerjakan.",
		image: mockups.howItWorks.step1,
		label: "Placeholder: Step 1 - Post Task",
	},
	{
		id: 2,
		title: "Generator SOP AI",
		desc: "AI BANTU secara instan mengubah ringkasan menjadi SOP yang jelas dan dapat ditindaklanjuti.",
		image: mockups.howItWorks.step2,
		label: "Placeholder: Step 2 - AI SOP Generator",
	},
	{
		id: 3,
		title: "Mahasiswa Menerima Tugas",
		desc: "Mahasiswa yang cocok meninjau dan menerima tugas berdasarkan keterampilan mereka.",
		image: mockups.howItWorks.step3,
		label: "Placeholder: Step 3 - Student Accepts Task",
	},
	{
		id: 4,
		title: "Unggah Progres",
		desc: "Mahasiswa mengirimkan pekerjaan mereka melalui platform.",
		image: mockups.howItWorks.step4,
		label: "Placeholder: Step 4 - Upload Progress",
	},
	{
		id: 5,
		title: "Pemeriksaan Kualitas AI",
		desc: "AI kami memverifikasi pekerjaan dengan SOP sebelum ditinjau oleh UMKM.",
		image: mockups.howItWorks.step5,
		label: "Placeholder: Step 5 - AI Quality Check",
	},
	{
		id: 6,
		title: "Setujui Pekerjaan",
		desc: "UMKM meninjau dan menyetujui tugas yang telah diselesaikan.",
		image: mockups.howItWorks.step6,
		label: "Placeholder: Step 6 - Approve Work",
	},
	{
		id: 7,
		title: "Pembayaran Dicairkan",
		desc: "Escrow mencairkan pembayaran kepada mahasiswa secara instan.",
		image: mockups.howItWorks.step7,
		label: "Placeholder: Step 7 - Payment Released",
	},
	{
		id: 8,
		title: "Portofolio Diperbarui",
		desc: "Portofolio terverifikasi mahasiswa diperbarui secara otomatis.",
		image: mockups.howItWorks.step8,
		label: "Placeholder: Step 8 - Portfolio Updated",
	},
];

export function HowItWorks() {
	const [activeStep, setActiveStep] = useState(0);

	return (
		<section className="bg-brand-light text-brand-dark relative">
			<div className="container mx-auto px-6 py-32">
				<div className="text-center mb-20">
					<h2 className="text-[clamp(2.4rem,4.5vw,4.4rem)] font-semibold tracking-[-0.03em] leading-[1.05] text-brand-dark font-display mb-6 text-balance">
						Cara Kerjanya
					</h2>
					<p className="text-lg md:text-xl text-brand-dark/80 max-w-3xl mx-auto leading-relaxed text-balance">
						Proses yang mulus dengan bantuan AI, dari posting hingga pembayaran.
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
									Langkah 0{step.id}
								</div>
								<h3 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-tight mb-4 font-display text-brand-dark text-balance">
									{step.title}
								</h3>
								<p className="text-lg md:text-2xl text-brand-dark/80 leading-relaxed max-w-xl text-balance">
									{step.desc}
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
