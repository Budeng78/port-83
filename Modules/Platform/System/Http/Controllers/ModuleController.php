<?php

namespace Modules\Platform\System\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;

class ModuleController extends Controller
{
    /**
     * Mengambil seluruh module berdasarkan module.json
     * secara recursive dari direktori Modules/.
     *
     * Folder yang diawali "#" dianggap sebagai folder
     * yang belum digunakan dan akan diabaikan.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->discoverModules(),
        ]);
    }

    /**
     * Toggle status aktif/nonaktif module berdasarkan alias.
     */
    public function toggle(string $alias): JsonResponse
    {
        $module = $this->findModuleByAlias($alias);

        if (!$module) {
            return response()->json([
                'status' => 'error',
                'message' => 'Modul tidak ditemukan.',
            ], 404);
        }

        $moduleData = $module['data'];

        $moduleData['is_active'] = !($moduleData['is_active'] ?? true);

        File::put(
            $module['path'],
            json_encode(
                $moduleData,
                JSON_PRETTY_PRINT
                | JSON_UNESCAPED_SLASHES
                | JSON_UNESCAPED_UNICODE
            )
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Status modul berhasil diperbarui.',
            'data' => [
                ...$moduleData,
                'folder_name' => $module['folder_name'],
                'path' => $module['relative_path'],
            ],
        ]);
    }

    /**
     * Discovery seluruh module.json secara recursive.
     */
    private function discoverModules(): array
    {
        $modulesPath = base_path('Modules');

        if (!File::isDirectory($modulesPath)) {
            return [];
        }

        $modules = [];

        $this->scanDirectory(
            $modulesPath,
            $modules,
            $modulesPath
        );

        return $modules;
    }

    /**
     * Scan directory secara recursive.
     */
    private function scanDirectory(
        string $directory,
        array &$modules,
        string $modulesRoot
    ): void {
        /*
         * Jika folder diawali "#", seluruh isinya
         * dianggap belum digunakan.
         */
        if ($directory !== $modulesRoot) {
            $folderName = basename($directory);

            if (str_starts_with($folderName, '#')) {
                return;
            }
        }

        /*
         * Jika directory mempunyai module.json,
         * maka directory tersebut dianggap sebagai module.
         */
        $moduleJson = $directory . DIRECTORY_SEPARATOR . 'module.json';

        if (File::exists($moduleJson)) {
            $data = json_decode(
                File::get($moduleJson),
                true
            );

            if (is_array($data)) {
                $relativePath = str_replace(
                    $modulesRoot . DIRECTORY_SEPARATOR,
                    '',
                    $directory
                );

                $data['folder_name'] = basename($directory);
                $data['relative_path'] = $relativePath;
                $data['is_active'] = $data['is_active'] ?? true;

                $modules[] = $data;
            }

            /*
             * Tidak perlu mencari module.json lagi
             * di dalam module ini.
             *
             * Satu module = satu module.json.
             */
            return;
        }

        /*
         * Lanjutkan pencarian ke subdirectory.
         */
        foreach (File::directories($directory) as $childDirectory) {
            $this->scanDirectory(
                $childDirectory,
                $modules,
                $modulesRoot
            );
        }
    }

    /**
     * Mencari module berdasarkan alias.
     */
    private function findModuleByAlias(string $alias): ?array
    {
        $modulesPath = base_path('Modules');

        if (!File::isDirectory($modulesPath)) {
            return null;
        }

        return $this->findModuleRecursive(
            $modulesPath,
            $modulesPath,
            $alias
        );
    }

    /**
     * Recursive lookup berdasarkan alias.
     */
    private function findModuleRecursive(
        string $directory,
        string $modulesRoot,
        string $alias
    ): ?array {
        if ($directory !== $modulesRoot) {
            $folderName = basename($directory);

            if (str_starts_with($folderName, '#')) {
                return null;
            }
        }

        $moduleJson = $directory . DIRECTORY_SEPARATOR . 'module.json';

        if (File::exists($moduleJson)) {
            $data = json_decode(
                File::get($moduleJson),
                true
            );

            if (
                is_array($data)
                && isset($data['alias'])
                && strcasecmp($data['alias'], $alias) === 0
            ) {
                return [
                    'path' => $moduleJson,
                    'folder_name' => basename($directory),
                    'relative_path' => str_replace(
                        $modulesRoot . DIRECTORY_SEPARATOR,
                        '',
                        $directory
                    ),
                    'data' => $data,
                ];
            }

            return null;
        }

        foreach (File::directories($directory) as $childDirectory) {
            $result = $this->findModuleRecursive(
                $childDirectory,
                $modulesRoot,
                $alias
            );

            if ($result !== null) {
                return $result;
            }
        }

        return null;
    }
}