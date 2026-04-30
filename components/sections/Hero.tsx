"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";

const popularServices = [
	{ title: "Vibe Coding", color: "bg-[#006d38]", image: "/images/vibecoding.webp" },
	{ title: "Website Development", color: "bg-[#006d38]", image: "/images/webdev.webp" },
	{ title: "Video Editing", color: "bg-[#006d38]", image: "/images/videoediting.png" },
	{ title: "Software Development", color: "bg-[#006d38]", image: "/images/softwaredevelopment.jpg" },
	{ title: "Social Media Management", color: "bg-[#006d38]", image: "/images/socialmedia.webp" },
	{ title: "Data Analytics & Research", color: "bg-[#006d38]", image: "/images/dataanalytics.jpg" },
	{ title: "Copywriting & Content", color: "bg-[#006d38]", image: "/images/copywriting.jpg" },
	{ title: "Graphic Design & UI/UX", color: "bg-[#006d38]", image: "/images/graphicdesign.jpg" },
	{ title: "Mobile App Development", color: "bg-[#006d38]", image: "/images/mobiledev.jpg" },
	{ title: "SEO & Digital Marketing", color: "bg-[#006d38]", image: "/images/digital-marketing.jpg" },
];

export function Hero() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [mode, setMode] = useState<"hire" | "work">("hire");

	const [emblaRef, emblaApi] = useEmblaCarousel({ 
		loop: false, 
		align: "start",
		containScroll: "trimSnaps",
		dragFree: true
	});

	const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
	const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

	const handleSearch = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			router.push("/marketplace");
		}
	};

	return (
		<section className="relative min-h-screen pt-32 pb-20 bg-background text-foreground">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl">
				{/* Main Hero Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="relative rounded-[2rem] overflow-hidden bg-primary text-primary-foreground shadow-2xl h-150 flex items-center"
				>
					{/* Background Image Placeholder */}
					<div
						className="absolute inset-0 transition-transform duration-[2s] hover:scale-105 pointer-events-none"
						style={{
							backgroundSize: "cover",
							backgroundPosition: "center",
							opacity: 0.4,
						}}
					/>

					<div className="relative z-10 px-8 sm:px-16 md:px-24 w-full md:w-3/4 lg:w-4/5 pt-12 pb-12">
						<h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium tracking-tight font-display mb-6 leading-[1.05] text-balance">
							{mode === "hire" 
								? "Pekerjakan ahli yang dibutuhkan bisnis Anda"
								: "Temukan proyek yang membangun portofolio Anda"}
						</h1>

						<p className="text-base md:text-xl text-primary-foreground/80 mb-10 max-w-2xl font-sans leading-relaxed text-balance font-light">
							{mode === "hire"
								? "Akses pekerja lepas terampil yang siap membantu Anda membangun dan mengembangkan bisnis — tanpa komitmen penuh waktu"
								: "Dapatkan akses ke tugas mikro dari UMKM lokal yang dikonversi menjadi pengalaman kerja nyata dan portofolio terverifikasi"}
						</p>

						{/* Toggle: Hire vs Work */}
						<div className="flex bg-black/20 backdrop-blur-md rounded-full p-1 w-fit mb-6 shadow-inner border border-white/10">
							<button 
								onClick={() => setMode("hire")}
								className={cn(
									"px-6 py-2 rounded-full font-medium text-sm transition-all shadow-sm cursor-pointer",
									mode === "hire" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"
								)}
							>
								Saya ingin merekrut
							</button>
							<button 
								onClick={() => setMode("work")}
								className={cn(
									"px-6 py-2 rounded-full font-medium text-sm transition-all cursor-pointer",
									mode === "work" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"
								)}
							>
								Saya ingin bekerja
							</button>
						</div>

						{/* Search Bar */}
						<form 
							onSubmit={handleSearch}
							className="relative max-w-2xl group flex items-center bg-white rounded-2xl p-2 pl-6 focus-within:ring-2 focus-within:ring-primary-foreground/50 transition-all shadow-xl"
						>
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={mode === "hire" ? "Cari layanan apa saja..." : "Cari tugas atau kategori..."}
								className="w-full bg-transparent border-none outline-none text-brand-dark placeholder:text-brand-dark/50 font-sans text-base leading-none"
							/>
							<button 
								type="submit"
								className="shrink-0 h-10 px-6 rounded-xl bg-primary hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md cursor-pointer"
							>
								<Search className="w-5 h-5 text-white" />
								<span className="text-white font-medium hidden sm:block">
									Cari
								</span>
							</button>
						</form>

						{/* Suggestion Pills */}
						<div className="flex flex-wrap gap-3 mt-8">
							{(mode === "hire" 
								? ["Desain Web", "Pengembangan AI", "Pengeditan Video", "Google Ads"]
								: ["Social Media", "Data Entry", "Graphic Design", "Writing"]
							).map((tag) => (
								<button
									key={tag}
									onClick={() => {
										setSearchQuery(tag);
										router.push(`/marketplace?q=${encodeURIComponent(tag)}`);
									}}
									className="px-4 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
								>
									{tag}
									<ArrowRight className="w-3 h-3 opacity-60" />
								</button>
							))}
						</div>
					</div>
				</motion.div>

				{/* Popular Services Carousel */}
				<div className="mt-20 sm:mt-24 mb-12 relative group">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-3xl sm:text-5xl font-medium tracking-tight leading-tight text-foreground font-display text-balance">
							Layanan populer
						</h2>
						<div className="hidden sm:flex gap-2">
							<button
								onClick={scrollPrev}
								className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-border hover:bg-muted transition-colors cursor-pointer"
								aria-label="Scroll left"
							>
								<ChevronLeft className="w-5 h-5 text-foreground" />
							</button>
							<button
								onClick={scrollNext}
								className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-border hover:bg-muted transition-colors cursor-pointer"
								aria-label="Scroll right"
							>
								<ChevronRight className="w-5 h-5 text-foreground" />
							</button>
						</div>
					</div>

					<div
						className="overflow-hidden"
						ref={emblaRef}
					>
						<div className="flex gap-6 pb-12 pt-4 px-1">
							{popularServices.map((service, index) => (
								<motion.div
									key={service.title}
									className={`shrink-0 w-[280px] lg:w-[calc((100%-6rem)/5)] h-[300px] lg:h-[320px] rounded-[1.5rem] p-1 flex flex-col cursor-pointer border border-border/50 hover:-translate-y-4 transition-all duration-300 bg-primary shadow-xl`}
								>
									<div className="p-5 flex-1 mt-1">
										<h3 className="text-base lg:text-lg font-medium tracking-tight text-white font-display leading-tight text-balance">
											{service.title}
										</h3>
									</div>
									{/* Bottom Image Area - Square */}
									<div className="w-full aspect-square bg-white rounded-[1.25rem] mt-auto overflow-hidden relative">
										<img 
											src={service.image} 
											alt={service.title} 
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
