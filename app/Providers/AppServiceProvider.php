<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Otomatis memindai semua folder di dalam direktori Modules/
        $modulesPath = base_path('Modules');

        if (is_dir($modulesPath)) {
            foreach (glob($modulesPath . '/*', GLOB_ONLYDIR) as $moduleDir) {
                $moduleName = basename($moduleDir); // Contoh: LandingPages
                $lowerName = strtolower($moduleName); // Contoh: landingpages

                // 1. Otomatis muat migrasi jika foldernya ada
                $migrationPath = $moduleDir . '/Database/migrations';
                if (is_dir($migrationPath)) {
                    $this->loadMigrationsFrom($migrationPath);
                }

                // 2. Otomatis muat rute API jika filenya ada
                $apiRoutePath = $moduleDir . '/Routes/api.php';
                if (file_exists($apiRoutePath)) {
                    Route::middleware('api')
                        ->prefix('api')
                        ->group($apiRoutePath);
                }

                // 3. Otomatis muat rute Web jika filenya ada
                $webRoutePath = $moduleDir . '/Routes/web.php';
                if (file_exists($webRoutePath)) {
                    Route::middleware('web')
                        ->group($webRoutePath);
                }

                // 4. Otomatis daftarkan namespace view (contoh: landingpages::)
                $viewPath = $moduleDir . '/Resources/views';
                if (is_dir($viewPath)) {
                    View::addNamespace($lowerName, $viewPath);
                }
            }
        }
    }
}