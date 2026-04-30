export const getLang = () => {
  return (process.env.NEXT_PUBLIC_APP_LANG || 'id') as 'id' | 'en';
};

// Map of Indonesian strings to English translations.
// We use Indonesian as the base/default key.
const enTranslations: Record<string, string> = {
  // Navbar
  "Marketplace": "Marketplace",
  "Tasks": "Tasks",
  "Chat": "Chat",
  "Wallet": "Wallet",
  "My Posts": "My Posts",
  "My Tasks": "My Tasks",
  "Dashboard": "Dashboard",
  "Profile": "Profile",
  "Log out": "Log out",
  "Login": "Login",
  "Join Now": "Join Now",
  "+ Post Project": "+ Post Project",

  "Informasi Pribadi": "Personal Information",
  "Kustomisasi Portofolio": "Portfolio Customization",
  "Keamanan": "Security",
  "Notifikasi": "Notifications",
  "Profil UMKM": "SME Profile",
  "Kelola informasi pribadi, keamanan, dan preferensi akun Anda.": "Manage your personal information, security, and account preferences.",
  
  // Hero Section
  "Pekerjakan ahli yang dibutuhkan bisnis Anda": "Hire the experts your business needs",
  "Temukan proyek yang membangun portofolio Anda": "Find projects that build your portfolio",
  "Akses pekerja lepas terampil yang siap membantu Anda membangun dan mengembangkan bisnis — tanpa komitmen penuh waktu": "Access skilled freelancers ready to help you build and grow your business — without full-time commitment",
  "Dapatkan akses ke tugas mikro dari UMKM lokal yang dikonversi menjadi pengalaman kerja nyata dan portofolio terverifikasi": "Get access to micro-tasks from local UMKM that convert into real work experience and verified portfolio",
  "Saya ingin merekrut": "I want to hire",
  "Saya ingin bekerja": "I want to work",
  "Cari layanan apa saja...": "Search any service...",
  "Cari tugas atau kategori...": "Search tasks or categories...",
  "Cari": "Search",
  "Layanan populer": "Popular services",

  // Marketplace & Features
  "Pengembangan Web": "Website Development",
  "Pengeditan Video": "Video Editing",
  "Pengembangan Perangkat Lunak": "Software Development",
  "Manajemen Media Sosial": "Social Media Management",
  "Analitik & Riset Data": "Data Analytics & Research",
  "Penulisan Teks & Konten": "Copywriting & Content",
  "Desain Grafis & UI/UX": "Graphic Design & UI/UX",
  "Pengembangan Aplikasi Mobile": "Mobile App Development",
  "SEO & Pemasaran Digital": "SEO & Digital Marketing",

  "Hide Filters": "Hide Filters",
  "Show Filters": "Show Filters",
  "Filters": "Filters",
  "Temukan peluang terbaik untuk karir Anda.": "Find the best opportunities for your career.",
  "Search tasks...": "Search tasks...",
  "Belum ada proyek ditemukan": "No projects found",
  "View Task": "View Task",

  // Wallet
  "Top Up Mudah": "Easy Top Up",
  "Kelola pendapatan, pengeluaran, dan saldo escrow Anda.": "Manage your earnings, expenses, and escrow balance.",
  "Tarik Saldo": "Withdraw Balance",
  "Isi Saldo": "Top Up Balance",
  "Dana Anda dipegang aman di escrow dan hanya dicairkan setelah proyek disetujui. Aman bagi UMKM, terjamin bagi Mahasiswa. (Biaya platform 2% berlaku).": "Your funds are held securely in escrow and only released once the project is approved. Safe for SMEs, guaranteed for Students. (2% platform fee applies).",
  "Selesaikan tugas pertama Anda untuk melihat riwayat pembayaran di sini.": "Complete your first task to see payment history here.",
  "Posting proyek pertama Anda untuk memulai transaksi.": "Post your first project to start transacting.",
  "Cari Proyek": "Find Projects",
  "Posting Proyek": "Post Project",
  "Belum ada transaksi": "No transactions yet",

  // Profile
  "Lihat Portofolio Saya": "View My Portfolio",
  "Lihat Profil UMKM Saya": "View My SME Profile",
  "Personal Details": "Personal Details",
  "Update your public profile and contact information.": "Update your public profile and contact information.",
  "Edit Profile": "Edit Profile",
  "Lihat Profil": "View Profile",

  // Dashboard & Submission
  "Lihat Semua": "View All",
  "Tinjauan Baru": "New Reviews",
  "Silakan deskripsikan pekerjaan Anda sebelum meminta tinjauan AI.": "Please describe your work before requesting an AI review.",
  "Tinjauan AI gagal. Anda masih dapat mengirim secara manual.": "AI review failed. You can still submit manually.",
  "Pekerjaan berhasil dikirim! Menunggu tinjauan klien.": "Work submitted successfully! Awaiting client review.",
  "Anda telah mengirimkan pekerjaan untuk tugas ini. Menunggu tinjauan dari klien.": "You have submitted your work for this task. Awaiting review from the client.",

  // Landing Page Sections
  "Cara Kerjanya": "How It Works",
  "Proses yang mulus dengan bantuan AI, dari posting hingga pembayaran.": "A seamless AI-assisted process, from posting to payment.",
  "Langkah": "Step",
  "UMKM Posting Tugas": "SME Posts a Task",
  "Pemilik bisnis mengunggah judul tugas, kategori dan experience level yang dibutuhkan.": "Business owners upload task titles, categories, and required experience levels.",
  "Deskripsi Instan via AI": "Instant Description via AI",
  "AI BANTU menyusun SOP dan rincian tugas secara profesional secara otomatis untuk memastikan hasil kerja yang jelas. ": "BANTU AI automatically structures professional SOPs and task details to ensure clear deliverables. ",
  "Bidding & Pendaftaran": "Bidding & Application",
  "Mahasiswa meninjau marketplace dan mengajukan penawaran harga (bid) yang kompetitif untuk tugas tersebut.": "Students browse the marketplace and submit competitive bids for the task.",
  "Seleksi & Chat Langsung": "Selection & Direct Chat",
  "UMKM meninjau profil pelamar dan bisa berdiskusi langsung melalui fitur chat sebelum memilih mahasiswa terbaik.": "SMEs review applicant profiles and can discuss directly via chat before selecting the best student.",
  "Review Kualitas via AI": "Quality Review via AI",
  "Sebelum mahasiswa mengirim hasil kerja, AI kami memberikan feedback instan untuk memastikan kualitas sesuai standar.": "Before students submit their work, our AI provides instant feedback to ensure quality meets standards.",
  "Persetujuan UMKM": "SME Approval",
  "UMKM menerima hasil kerja, meninjau deliverables, dan memberikan persetujuan akhir.": "SMEs receive the work, review deliverables, and provide final approval.",
  "Pembayaran Otomatis": "Automatic Payment",
  "Setelah disetujui, dana yang tertahan di sistem escrow langsung dicairkan ke wallet mahasiswa.": "Once approved, funds held in the escrow system are immediately released to the student's wallet.",
  "Update Portofolio": "Portfolio Update",
  "Riwayat kerja mahasiswa diperbarui secara otomatis dengan bukti kerja nyata yang diverifikasi platform.": "Student work history is automatically updated with verified real-world proof of work.",
  
  "Mengapa BANTU Bekerja": "Why BANTU Works",
  "Jembatan Itu Ada di Sini.": "The Bridge is Here.",
  "BANTU adalah ekosistem di mana tugas mikro UMKM berubah menjadi portofolio mahasiswa. Cepat, andal, dan adil.": "BANTU is an ecosystem where SME micro-tasks turn into student portfolios. Fast, reliable, and fair.",
  
  "Fitur Utama": "Core Features",
  "Semua yang Anda butuhkan untuk mengelola tugas mikro dengan aman dan membangun portofolio yang dapat diverifikasi.": "Everything you need to manage micro-tasks securely and build a verifiable portfolio.",
  "Pasar Tugas (Bidding)": "Task Marketplace (Bidding)",
  "Mahasiswa dapat mengajukan penawaran harga (bid) terbaik mereka untuk tugas yang diposting oleh UMKM, menciptakan pasar yang kompetitif dan adil.": "Students can submit their best bids for tasks posted by SMEs, creating a competitive and fair market.",
  "Pembuat CV Otomatis": "Automatic CV Builder",
  "Setiap riwayat tugas yang berhasil diselesaikan secara otomatis dikonversi menjadi entri CV profesional yang terverifikasi dan siap cetak (ATS-friendly).": "Every successfully completed task history is automatically converted into a verified, print-ready professional CV entry (ATS-friendly).",
  "Chat & Diskusi Terpadu": "Integrated Chat & Discussion",
  "Komunikasi langsung antara UMKM dan mahasiswa melalui platform untuk koordinasi proyek, revisi, dan negosiasi yang lebih efisien.": "Direct communication between SMEs and students via the platform for more efficient project coordination, revisions, and negotiation.",
  "Pembayaran Escrow Aman": "Secure Escrow Payment",
  "Dana dikunci di awal oleh BANTU dan hanya dicairkan ketika UMKM memberikan persetujuan, menjamin keamanan transaksi bagi kedua belah pihak.": "Funds are locked upfront by BANTU and only released when the SME gives approval, ensuring transaction security for both parties.",
  
  "Dipercaya oleh universitas terkemuka dan bisnis-bisnis yang sedang berkembang": "Trusted by top universities and growing businesses",
  "Tugas Mikro Selesai": "Micro-Tasks Completed",
  "Mahasiswa Terverifikasi": "Verified Students",
  "UMKM Aktif": "Active SMEs",
  "Dibayarkan ke Mahasiswa": "Paid to Students",
  "Orientasi Lebih Baik dengan BANTU": "Better Onboarding with BANTU",
  "BANTU benar-benar mengubah cara saya dalam menerima klien baru. Terlihat rapi, mudah digunakan, dan memungkinkan saya menyesuaikannya. Klien sangat menyukai betapa lancarnya proses dari hari pertama.": "BANTU completely changed how I onboard new clients. It looks sleek, is easy to use, and allows me to customize it. Clients love how smooth the process is from day one.",
  "CEO DI ONLY EVERYTHING": "CEO AT ONLY EVERYTHING",
  "Portal Klien Bermerek - Mengubah Segalanya": "Branded Client Portal - A Game Changer",
  "Manajemen tugas di BANTU telah secara nyata meningkatkan produktivitas kami. Hal ini memungkinkan pekerjaan dilakukan secara konsisten dan cepat, membuat klien kami merasa lebih dihargai dan didukung.": "Task management in BANTU has noticeably increased our productivity. It allows work to be done consistently and quickly, making our clients feel more valued and supported.",
  "CEO DI SOCIAL PRO": "CEO AT SOCIAL PRO",
  "Solusi Cerdas untuk Konten": "Smart Solution for Content",
  "Kami membutuhkan puluhan deskripsi produk singkat. Para mahasiswa di BANTU dapat menyelesaikannya dalam waktu 48 jam. Generator SOP AI miliknya benar-benar menakjubkan.": "We needed dozens of short product descriptions. The students on BANTU were able to get it done in 48 hours. Its AI SOP generator is truly amazing.",
  "PENDIRI DI SNOW SERVICES": "FOUNDER AT SNOW SERVICES",
  "Jalur Bakat Terverifikasi": "Verified Talent Pipeline",
  "Kami bahkan tidak melihat CV tradisional lagi untuk posisi junior. Kami melihat portofolio BANTU mereka. Di situlah bukti hasil kerja dan keandalan yang sebenarnya terlihat.": "We don't even look at traditional CVs anymore for junior roles. We look at their BANTU portfolio. That's where the real proof of work and reliability shows.",
  "DIREKTUR PEMASARAN": "MARKETING DIRECTOR",
  
  "Bantuan": "Help",
  "Pertanyaan Umum.": "Frequently Asked Questions.",
  "Semua yang perlu Anda ketahui tentang memulai proyek pertama Anda di BANTU.": "Everything you need to know about starting your first project on BANTU.",
  "Punya pertanyaan lain?": "Have another question?",
  "Email kami di": "Email us at",
  "atau tanyakan langsung pada chatbot kami di pojok kanan bawah.": "or ask our chatbot directly in the bottom right corner.",
  "Bagaimana cara kerja sistem bidding?": "How does the bidding system work?",
  "Mahasiswa dapat mengajukan penawaran harga (bid) untuk tugas yang diposting UMKM. UMKM kemudian meninjau profil, portofolio, dan harga yang ditawarkan sebelum memilih mahasiswa terbaik untuk proyek tersebut.": "Students can submit bids for tasks posted by SMEs. The SME then reviews profiles, portfolios, and quoted prices before selecting the best student for the project.",
  "Apakah AI benar-benar meninjau hasil kerja?": "Does AI really review the work?",
  "Ya, AI kami menganalisis teks dan gambar hasil pekerjaan mahasiswa berdasarkan SOP yang ada. Fitur ini memberikan feedback instan untuk memastikan kualitas terbaik sebelum diserahkan kepada UMKM.": "Yes, our AI analyzes text and image deliverables from students based on the existing SOP. This feature provides instant feedback to ensure the best quality before submission to the SME.",
  "Berapa lama proses pencairan dana?": "How long does the fund disbursement process take?",
  "Setelah UMKM menyetujui pekerjaan, dana dari sistem escrow akan langsung masuk ke wallet mahasiswa. Mahasiswa kemudian dapat menarik saldo tersebut ke rekening bank pribadi mereka.": "Once the SME approves the work, funds from the escrow system will directly enter the student's wallet. Students can then withdraw the balance to their personal bank accounts.",
  "Apakah ada biaya platform untuk mahasiswa?": "Is there a platform fee for students?",
  "BANTU mengenakan biaya platform sebesar 2% untuk setiap transaksi yang berhasil. Biaya ini digunakan untuk memelihara sistem escrow yang aman dan fitur pendukung AI kami.": "BANTU charges a 2% platform fee for every successful transaction. This fee is used to maintain a secure escrow system and our AI support features.",
  
  "Mulai Hari Ini": "Start Today",
  "Siap Menjembatani Kesenjangan?": "Ready to Bridge the Gap?",
  "Bergabunglah dengan ribuan mahasiswa yang sedang membangun karier mereka, dan UMKM yang mempercepat pertumbuhan mereka bersama BANTU.": "Join thousands of students building their careers, and SMEs accelerating their growth with BANTU.",
  "Mulai Secara Gratis": "Get Started for Free",
};

export const t = (indonesianText: string): string => {
  const lang = getLang();
  if (lang === 'id') return indonesianText;
  return enTranslations[indonesianText] || indonesianText;
};

// Helper function to dynamically add translations
export const addTranslation = (id: string, en: string) => {
  enTranslations[id] = en;
};
