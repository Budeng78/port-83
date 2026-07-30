
<nav class="sticky top-0 z-[1020] bg-gradient-to-r from-[#081a4d]/90 via-[#1e3a8a]/90 to-[#3b82f6]/90 backdrop-blur-md border-b border-white/20 shadow-xl transition-all duration-300">
    <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-center h-16 md:h-20">
            
            <!-- Logo & Brand -->
            <a href="/" class="flex items-center gap-4 group">
                <div class="relative">
                    <img src="{{ asset('storage/Modules/LandingPages/assets/images/logo_mc-wartono.png') }}" 
                         alt="Logo PT. Sukun Wartono Indonesia" 
                         class="h-10 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md" />
                </div>
                <div class="hidden md:block h-8 w-[1px] bg-white/20 mx-1"></div>
                <div class="flex flex-col leading-none">
                    <span class="text-sm md:text-lg font-black text-white uppercase italic tracking-tighter drop-shadow-sm">
                        PT. Sukun Wartono Indonesia
                    </span>
                    <span class="text-[8px] md:text-[9px] text-blue-200 font-bold lowercase tracking-[0.3em] mt-1 opacity-90 uppercase">
                        Progres24
                    </span>
                </div>
            </a>

            <!-- Mobile Menu Button -->
            <button id="mobile-menu-button" class="md:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-colors focus:outline-none">
                <svg id="icon-open" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <svg id="icon-close" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center gap-10">
                <div class="flex items-center gap-8">
                    <a href="#manifesto" class="text-[11px] font-black text-blue-50 hover:text-white uppercase tracking-[0.2em] transition-all hover:translate-y-[-1px]">
                        Manifesto
                    </a>
                    <a href="#about" class="text-[11px] font-black text-blue-50 hover:text-white uppercase tracking-[0.2em] transition-all hover:translate-y-[-1px]">
                        Tentang Kami
                    </a>
                    
                </div>
                
                <div class="h-6 w-px bg-white/20"></div>
                
                <a href="/app/login" class="inline-flex items-center justify-center px-8 py-3 rounded-2xl bg-white text-[#081a4d] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all active:scale-95 shadow-lg">
                    Login
                </a>
            </div>

        </div>
    </div>

    <!-- Mobile Menu Container -->
    <div id="mobile-menu" class="hidden bg-[#081a4d]/95 backdrop-blur-lg border-b border-white/20 absolute w-full left-0 p-10 shadow-2xl space-y-8 z-[-1] animate-fade-in-down">
        <div class="flex flex-col gap-8 text-center">
            <a href="#manifesto" class="mobile-link text-[12px] font-black text-blue-100 uppercase tracking-[0.3em] hover:text-white">
                Manifesto
            </a>
            <a href="#about" class="mobile-link text-[12px] font-black text-blue-100 uppercase tracking-[0.3em] hover:text-white">
                Tentang Kami
            </a>
            <a href="/timbangan" class="mobile-link text-[12px] font-black text-blue-100 uppercase tracking-[0.3em] hover:text-white">
                Timbangan
            </a>
            <hr class="border-white/10 mx-auto w-20">
            <a href="/app/login" class="flex items-center justify-center w-full py-5 rounded-3xl bg-white text-[#081a4d] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl active:scale-[0.98] transition-all">
                Masuk ke Aplikasi
            </a>
        </div>
    </div>
</nav>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('mobile-menu-button');
        const menu = document.getElementById('mobile-menu');
        const iconOpen = document.getElementById('icon-open');
        const iconClose = document.getElementById('icon-close');

        const toggle = () => {
            const isHidden = menu.classList.toggle('hidden');
            iconOpen.classList.toggle('hidden', !isHidden);
            iconClose.classList.toggle('hidden', isHidden);
            
            document.body.style.overflow = isHidden ? '' : 'hidden';
        };

        btn.addEventListener('click', toggle);

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', toggle);
        });
    });
</script>

<style>
    @keyframes fade-in-down {
        from { opacity: 0; transform: translateY(-15px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-down {
        animation: fade-in-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
</style>