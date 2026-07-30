<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'Parjos') }} - PT. Sukun Wartono Indonesia</title>
    @vite(['resources/css/app.css'])
</head>
<body class="bg-white text-slate-900 antialiased min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white">
    
    @include('landingpages::layouts.navbar')

    <main class="flex-grow">
        @yield('content')
    </main>

    @include('landingpages::partials.footer')

</body>
</html>