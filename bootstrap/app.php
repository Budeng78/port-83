<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Otomatis memindai dan meload route dari setiap modul di /Modules
            $modulesPath = base_path('Modules');
            if (is_dir($modulesPath)) {
                $modules = scandir($modulesPath);
                foreach ($modules as $module) {
                    if ($module === '.' || $module === '..') continue;
                    
                    $modulePath = $modulesPath . '/' . $module;
                    if (is_dir($modulePath)) {
                        // Cek status aktif modul melalui module.json
                        $moduleJsonPath = $modulePath . '/module.json';
                        $isActive = true;

                        if (file_exists($moduleJsonPath)) {
                            $manifest = json_decode(file_get_contents($moduleJsonPath), true);
                            $isActive = $manifest['is_active'] ?? true;
                        }

                        // Jika modul dinonaktifkan, lewati pemuatan rute
                        if (!$isActive) {
                            continue;
                        }

                        // 1. Muat Web Route
                        $webRoutePath = $modulePath . '/Routes/web.php';
                        if (file_exists($webRoutePath)) {
                            Route::middleware('web')->group($webRoutePath);
                        }

                        // 2. Muat API Route (otomatis diberi prefiks /api)
                        $apiRoutePath = $modulePath . '/Routes/api.php';
                        if (file_exists($apiRoutePath)) {
                            Route::prefix('api')
                                ->middleware('api')
                                ->group($apiRoutePath);
                        }
                    }
                }
            }
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();