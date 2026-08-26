<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))

    /*
    |--------------------------------------------------------------------------
    | Routing
    |--------------------------------------------------------------------------
    */

    ->withRouting(
        web: __DIR__.'/../routes/web.php',

        api: __DIR__.'/../routes/api.php',

        commands: __DIR__.'/../routes/console.php',

        health: '/up',

        then: function () {

            $modulesPath = base_path('Modules');

            /**
             * =========================================================
             * LOAD MODULE ROUTES RECURSIVELY
             * =========================================================
             */
            $loadModuleRoutes = function (string $directory) use (&$loadModuleRoutes) {

                if (!is_dir($directory)) {
                    return;
                }

                $items = scandir($directory);

                foreach ($items as $item) {

                    if ($item === '.' || $item === '..') {
                        continue;
                    }

                    $path = $directory . DIRECTORY_SEPARATOR . $item;

                    if (!is_dir($path)) {
                        continue;
                    }

                    /**
                     * =================================================
                     * MODULE DETECTION
                     * =================================================
                     *
                     * Folder yang mempunyai module.json
                     * dianggap sebagai module aktif.
                     */
                    $moduleJsonPath = $path . DIRECTORY_SEPARATOR . 'module.json';

                    if (file_exists($moduleJsonPath)) {

                        $manifest = json_decode(
                            file_get_contents($moduleJsonPath),
                            true
                        );

                        $isActive = $manifest['is_active'] ?? true;

                        /**
                         * Module nonaktif tidak dimuat.
                         */
                        if (!$isActive) {
                            continue;
                        }

                        /**
                         * =================================================
                         * WEB ROUTES
                         * =================================================
                         */
                        $webRoutePath = $path . DIRECTORY_SEPARATOR . 'Routes/web.php';

                        if (file_exists($webRoutePath)) {

                            Route::middleware('web')
                                ->group($webRoutePath);
                        }

                        /**
                         * =================================================
                         * API ROUTES
                         * =================================================
                         *
                         * Semua route API module mendapatkan prefix:
                         *
                         * /api
                         *
                         * dan middleware:
                         *
                         * api
                         */
                        $apiRoutePath = $path . DIRECTORY_SEPARATOR . 'Routes/api.php';

                        if (file_exists($apiRoutePath)) {

                            Route::prefix('api')
                                ->middleware('api')
                                ->group($apiRoutePath);
                        }

                        /**
                         * =================================================
                         * MODULE SUDAH DITEMUKAN
                         * =================================================
                         *
                         * Jangan scan isi module lagi sebagai
                         * module baru.
                         */
                        continue;
                    }

                    /**
                     * =====================================================
                     * GROUPING FOLDER
                     * =====================================================
                     *
                     * Contoh:
                     *
                     * Modules/
                     * ├── Platform/
                     * │   ├── Auth/
                     * │   ├── Dashboard/
                     * │   ├── RBAC/
                     * │   └── System/
                     *
                     * └── Business/
                     *
                     * Folder seperti Platform dan Business
                     * tidak mempunyai module.json.
                     *
                     * Maka lanjut scan ke bawah.
                     */
                    $loadModuleRoutes($path);
                }
            };

            /**
             * Mulai scan seluruh Modules.
             */
            $loadModuleRoutes($modulesPath);
        },
    )

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    */

    ->withMiddleware(function (Middleware $middleware) {

        //
        // Middleware global/application
        //
        // Untuk saat ini tidak ada konfigurasi tambahan.
        //

    })

    /*
    |--------------------------------------------------------------------------
    | Exceptions
    |--------------------------------------------------------------------------
    */

    ->withExceptions(function (Exceptions $exceptions) {

        /**
         * ================================================================
         * API REQUEST HARUS SELALU MENGGUNAKAN JSON RESPONSE
         * ================================================================
         *
         * Jika request menuju:
         *
         * /api/*
         *
         * Laravel akan memperlakukannya sebagai API request.
         *
         * Contoh:
         *
         * GET /api/auth/me
         *
         * Jika user belum authenticated:
         *
         * 401 Unauthorized
         *
         * bukan:
         *
         * redirect ke route('login')
         *
         * Hal ini penting karena aplikasi kita menggunakan:
         *
         * React SPA
         * +
         * Laravel API
         * +
         * Sanctum
         */
        $exceptions->shouldRenderJsonWhen(function ($request, $input) {

            return $request->is('api/*');
        });

    })

    /*
    |--------------------------------------------------------------------------
    | Create Application
    |--------------------------------------------------------------------------
    */

    ->create();