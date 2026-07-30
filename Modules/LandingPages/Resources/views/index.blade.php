<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'Parjos') }} - Landing Page</title>
    
    <!-- Memuat CSS utama via Vite -->
    @vite(['resources/css/app.css'])
</head>
<body class="bg-slate-950 text-white antialiased min-h-screen flex flex-col justify-between">
    
    <!-- Navbar -->
    <header class="container mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-800">
        <h1 class="text-2xl font-bold tracking-wider text-indigo-500">
            PROTOTYPE
        </h1>
        <div class="space-x-4">
            <a
                href="/login"
                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition shadow-lg shadow-indigo-600/20"
            >
                Login
            </a>
        </div>
    </header>

    <!-- Hero Section -->
    <main class="container mx-auto px-6 py-20 text-center max-w-4xl">
        <h2 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Integrated Management & Industrial Platform
        </h2>
        <p class="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Solusi sistem terpadu untuk efisiensi operasional, manajemen data, dan analisis performa skala industri.
        </p>
        <div class="flex justify-center gap-4">
            <a
                href="/login"
                class="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
                Get Started Now
            </a>
        </div>
    </main>

    <!-- Footer -->
    <footer class="text-center py-6 text-slate-600 border-t border-slate-900 text-sm">
        &copy; {{ date('Y') }} Parjos. All rights reserved.
    </footer>

</body>
</html>