<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Dashboard - PT SWI</title>

    @viteReactRefresh

    {{-- GLOBAL CSS + DASHBOARD REACT --}}
    @vite([
        'resources/css/app.css',
        'Modules/Dashboard/Resources/js/app.jsx'
    ])
</head>

<body>

    <div id="app"></div>

</body>
</html>