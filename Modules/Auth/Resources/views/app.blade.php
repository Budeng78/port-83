<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'prototype') }} - Login</title>
    
    <!-- Vite Assets untuk React & Tailwind -->
    @viteReactRefresh
    @vite([
    'resources/css/app.css',
    'Modules/Auth/Resources/js/app.jsx',
])
    
</head>
<body class="bg-slate-950 text-white antialiased min-h-screen m-0 p-0">
    
    <!-- Wadah Full-Screen untuk React Component -->
    <div id="auth-root" class="w-full min-h-screen"></div>

</body>
</html>