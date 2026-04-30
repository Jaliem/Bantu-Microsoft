"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const stats = [
	{ value: "10k+", label: "Tugas Mikro Selesai" },
	{ value: "5k+", label: "Mahasiswa Terverifikasi" },
	{ value: "2k+", label: "UMKM Aktif" },
	{ value: "Rp 5M+", label: "Dibayarkan ke Mahasiswa" },
];

const testimonials = [
	{
		name: "Nick Kasten",
		role: "CEO DI ONLY EVERYTHING",
		title: "Orientasi Lebih Baik dengan BANTU",
		quote: "BANTU benar-benar mengubah cara saya dalam menerima klien baru. Terlihat rapi, mudah digunakan, dan memungkinkan saya menyesuaikannya. Klien sangat menyukai betapa lancarnya proses dari hari pertama.",
		avatar: "https://i.pravatar.cc/150?u=nick",
	},
	{
		name: "Jeremy Moore",
		role: "CEO DI SOCIAL PRO",
		title: "Portal Klien Bermerek - Mengubah Segalanya",
		quote: "Manajemen tugas di BANTU telah secara nyata meningkatkan produktivitas kami. Hal ini memungkinkan pekerjaan dilakukan secara konsisten dan cepat, membuat klien kami merasa lebih dihargai dan didukung.",
		avatar: "https://i.pravatar.cc/150?u=jeremy",
	},
	{
		name: "Sarah Chen",
		role: "PENDIRI DI SNOW SERVICES",
		title: "Solusi Cerdas untuk Konten",
		quote: "Kami membutuhkan puluhan deskripsi produk singkat. Para mahasiswa di BANTU dapat menyelesaikannya dalam waktu 48 jam. Generator SOP AI miliknya benar-benar menakjubkan.",
		avatar: "https://i.pravatar.cc/150?u=sarah",
	},
	{
		name: "Budi Santoso",
		role: "DIREKTUR PEMASARAN",
		title: "Jalur Bakat Terverifikasi",
		quote: "Kami bahkan tidak melihat CV tradisional lagi untuk posisi junior. Kami melihat portofolio BANTU mereka. Di situlah bukti hasil kerja dan keandalan yang sebenarnya terlihat.",
		avatar: "https://i.pravatar.cc/150?u=budi",
	},
];

export function SocialProof() {
	// Use align: "center" so it peeks out on the sides of the full-width screen
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
	const [selectedIndex, setSelectedIndex] = useState(0);

	const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
	const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		emblaApi.on("select", onSelect);
		emblaApi.on("reInit", onSelect);
	}, [emblaApi, onSelect]);

	return (
		<section className="py-32 bg-brand-light text-brand-dark overflow-hidden">
			<div className="container mx-auto px-6">
				{/* Logos Placeholder */}
				<div className="mb-32 text-center">
					<p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-[0.22em] mb-10 font-sans">
						Dipercaya oleh universitas terkemuka dan bisnis-bisnis yang sedang berkembang
					</p>
					<div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
						<img src="/images/logo_binus.png" alt="BINUS University" className="h-10 md:h-14 w-auto object-contain" />
						<img src="/images/logo_untar.webp" alt="Tarumanagara University" className="h-10 md:h-14 w-auto object-contain" />
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
					{stats.map((stat, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.1 }}
							className="text-center"
						>
							<div className="text-4xl md:text-6xl font-medium tracking-tight leading-tight text-brand-dark font-display mb-3">
								{stat.value}
							</div>
							<div className="text-brand-dark/70 font-medium tracking-wide font-sans text-sm md:text-base">
								{stat.label}
							</div>
						</motion.div>
					))}
				</div>
			</div>

			{/* Testimonials Carousel - Full Width */}
			<div className="w-full relative group">
				<div className="overflow-hidden px-4 sm:px-12" ref={emblaRef}>
					<div className="flex -ml-6 items-center">
						{testimonials.map((testimonial, i) => (
							<div
								key={i}
								className="flex-[0_0_100%] min-w-0 md:flex-[0_0_60%] lg:flex-[0_0_45%] pl-6 py-12"
							>
								<div
									className={`p-8 md:p-12 rounded-[2rem] bg-white h-full shadow-lg transition-all duration-500 hover:-translate-y-2
                  ${selectedIndex === i ? "ring-2 ring-brand-mid scale-105 shadow-xl z-20" : "ring-1 ring-border opacity-50 scale-95"}
                `}
								>
									<div className="flex items-center gap-6 mb-8">
										<img
											src={testimonial.avatar}
											alt={testimonial.name}
											className="w-20 h-20 rounded-full object-cover shrink-0 ring-4 ring-brand-light"
										/>
										<div>
											<div className="text-2xl md:text-3xl font-medium tracking-tight text-brand-dark font-display mb-2">
												{testimonial.name}
											</div>
											<div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-mid/10 text-brand-mid text-xs font-semibold tracking-widest uppercase font-sans">
												{testimonial.role}
											</div>
										</div>
									</div>
									<div className="text-brand-dark/70 leading-relaxed text-lg font-sans font-light">
										<strong className="text-brand-dark text-xl font-medium tracking-tight block mb-2 text-balance">
											{testimonial.title}
										</strong>
										"{testimonial.quote}"
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Navigation Arrows */}
				<div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none px-4 sm:px-12 flex justify-between items-center z-30">
					<button
						onClick={scrollPrev}
						className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-brand-dark hover:text-brand-mid transition-all pointer-events-auto cursor-pointer border border-brand-dark/5 hover:scale-110 active:scale-95"
						aria-label="Previous testimonial"
					>
						<ChevronLeft size={24} />
					</button>
					<button
						onClick={scrollNext}
						className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-brand-dark hover:text-brand-mid transition-all pointer-events-auto cursor-pointer border border-brand-dark/5 hover:scale-110 active:scale-95"
						aria-label="Next testimonial"
					>
						<ChevronRight size={24} />
					</button>
				</div>
			</div>
		</section>
	);
}
