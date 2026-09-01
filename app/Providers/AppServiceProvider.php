<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
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
        $modulesPath = base_path('Modules');

        /**
         * =========================================================
         * LOAD MODULES RECURSIVELY
         * =========================================================
         *
         * Struktur:
         *
         * Modules/
         * ├── Business/
         * │   ├── Produksi/
         * │   └── RajangKrosok/
         * │
         * ├── LandingPages/
         * │
         * └── Platform/
         *     ├── Auth/
         *     ├── Dashboard/
         *     ├── RBAC/
         *     └── System/
         *
         * Folder yang memiliki module.json dianggap sebagai MODULE.
         */
        $loadModules = function (string $directory) use (&$loadModules): void {

            if (!is_dir($directory)) {
                return;
            }

            foreach (scandir($directory) as $item) {

                if ($item === '.' || $item === '..') {
                    continue;
                }

                $path = $directory . DIRECTORY_SEPARATOR . $item;

                if (!is_dir($path)) {
                    continue;
                }

                /**
                 * =====================================================
                 * CEK MODULE
                 * =====================================================
                 */
                $moduleJsonPath =
                    $path . DIRECTORY_SEPARATOR . 'module.json';

                /**
                 * Jika belum memiliki module.json,
                 * berarti kemungkinan folder grouping seperti:
                 *
                 * Modules/Platform
                 * Modules/Business
                 *
                 * Maka lanjut turun.
                 */
                if (!file_exists($moduleJsonPath)) {
                    $loadModules($path);
                    continue;
                }

                /**
                 * =====================================================
                 * BACA MANIFEST
                 * =====================================================
                 */
                $manifest = json_decode(
                    file_get_contents($moduleJsonPath),
                    true
                );

                if (!is_array($manifest)) {
                    continue;
                }

                /**
                 * =====================================================
                 * MODULE ACTIVE
                 * =====================================================
                 */
                if (($manifest['is_active'] ?? true) === false) {
                    continue;
                }

                /**
                 * =====================================================
                 * MODULE ALIAS
                 * =====================================================
                 *
                 * Contoh Dashboard:
                 *
                 * "name": "Dashboard"
                 * "alias": "dashboard"
                 *
                 * menghasilkan:
                 *
                 * dashboard::app
                 */
                $moduleName =
                    $manifest['alias']
                    ?? $manifest['name']
                    ?? basename($path);

                $lowerName = strtolower($moduleName);

                /**
                 * =====================================================
                 * MIGRATIONS
                 * =====================================================
                 */
                $migrationPath =
                    $path . DIRECTORY_SEPARATOR . 'Database/migrations';

                if (is_dir($migrationPath)) {
                    $this->loadMigrationsFrom($migrationPath);
                }

                /**
                 * =====================================================
                 * VIEW NAMESPACE
                 * =====================================================
                 *
                 * Contoh:
                 *
                 * Modules/Platform/Dashboard
                 *
                 * menjadi:
                 *
                 * dashboard::app
                 *
                 * yang menunjuk ke:
                 *
                 * Modules/Platform/Dashboard/Resources/views
                 */
                $viewPath =
                    $path . DIRECTORY_SEPARATOR . 'Resources/views';

                if (is_dir($viewPath)) {
                    View::addNamespace(
                        $lowerName,
                        $viewPath
                    );
                }
            }
        };

        /**
         * Mulai scan dari Modules/
         */
        $loadModules($modulesPath);
    }
}