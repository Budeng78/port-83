<?php

namespace Modules\System\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrashController extends Controller
{
    /**
     * Memindai seluruh model di semua modul yang menggunakan trait SoftDeletes secara otomatis (dengan pencegah duplikasi).
     */
    private function getAllSoftDeleteModels()
    {
        $models = [];
        $seenClasses = []; // Variabel untuk mencegah duplikasi model
        $modulesPath = base_path('Modules');
        if (!file_exists($modulesPath)) {
            return $models;
        }

        $moduleDirs = glob($modulesPath . '/*', GLOB_ONLYDIR);
        foreach ($moduleDirs as $moduleDir) {
            $possiblePaths = [
                $moduleDir . '/app/Models',
                $moduleDir . '/Models'
            ];
            foreach ($possiblePaths as $path) {
                if (file_exists($path)) {
                    $files = glob($path . '/*.php');
                    foreach ($files as $file) {
                        $className = basename($file, '.php');
                        $moduleName = basename($moduleDir);
                        
                        $ns = "Modules\\{$moduleName}\\Models\\{$className}";
                        if (!class_exists($ns)) {
                            $ns = "Modules\\{$moduleName}\\App\\Models\\{$className}";
                        }
                        
                        // Pastikan kelas ada dan belum pernah dimasukkan sebelumnya
                        if (class_exists($ns) && !isset($seenClasses[$ns])) {
                            $seenClasses[$ns] = true; // Tandai sudah diproses
                            
                            $traits = class_uses_recursive($ns);
                            if (in_array(SoftDeletes::class, $traits)) {
                                $models[] = [
                                    'module' => strtolower($moduleName),
                                    'resource' => Str::kebab(Str::plural($className)),
                                    'modelClass' => $ns
                                ];
                            }
                        }
                    }
                }
            }
        }
        return $models;
    }

    /**
     * Memetakan dan memvalidasi kelas Model berdasarkan Nama Modul dan Resource secara dinamis.
     */
    private function resolveModelClass($module, $resource)
    {
        $moduleName = Str::studly($module); 
        
        $modelsPath = base_path("Modules/{$moduleName}/app/Models");
        if (!file_exists($modelsPath)) {
            $modelsPath = base_path("Modules/{$moduleName}/Models");
        }

        if (!file_exists($modelsPath)) {
            abort(404, 'Modul tidak ditemukan.');
        }

        $modelName = Str::studly(Str::singular($resource));
        
        $modelClass = "Modules\\{$moduleName}\\Models\\{$modelName}";
        if (!class_exists($modelClass)) {
            $modelClass = "Modules\\{$moduleName}\\App\\Models\\{$modelName}";
        }

        if (!class_exists($modelClass)) {
            abort(404, 'Model tidak ditemukan di modul tersebut.');
        }

        $traits = class_uses_recursive($modelClass);
        if (!in_array(SoftDeletes::class, $traits)) {
            abort(403, 'Model ini tidak mendukung fitur Soft Delete.');
        }

        return $modelClass;
    }

    /**
     * Menampilkan data sampah untuk modul dan resource tertentu.
     */
    public function index($module, $resource)
    {
        $modelClass = $this->resolveModelClass($module, $resource);
        $instance = new $modelClass;
        $tableName = $instance->getTable();

        $trashedItems = $modelClass::onlyTrashed()->with('deletedBy')->get()->map(function ($item) use ($module, $resource, $tableName) {
            $item->source_module = $module;
            $item->source_resource = $resource;
            $item->table_name = $tableName;
            $item->display_title = $item->label ?? $item->name ?? $item->title ?? "ID: {$item->id}";
            $item->display_subtitle = $item->path ?? $item->email ?? null;
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $trashedItems,
        ]);
    }

    /**
     * Menampilkan SELURUH data sampah dari semua tabel/modul secara global.
     */
    public function indexAll()
    {
        $registeredModels = $this->getAllSoftDeleteModels();
        $allTrashed = collect();

        foreach ($registeredModels as $item) {
            try {
                $modelClass = $item['modelClass'];
                $instance = new $modelClass;
                $tableName = $instance->getTable();

                $trashedItems = $modelClass::onlyTrashed()->with('deletedBy')->get();

                foreach ($trashedItems as $trashedItem) {
                    $trashedItem->source_module = $item['module'];
                    $trashedItem->source_resource = $item['resource'];
                    $trashedItem->table_name = $tableName;
                    
                    // Deteksi teks utama secara dinamis (label, name, title, dll)
                    $trashedItem->display_title = $trashedItem->label 
                        ?? $trashedItem->name 
                        ?? $trashedItem->title 
                        ?? "ID: {$trashedItem->id}";

                    $trashedItem->display_subtitle = $trashedItem->path 
                        ?? $trashedItem->email 
                        ?? null;

                    $allTrashed->push($trashedItem);
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        $sortedData = $allTrashed->sortByDesc('deleted_at')->values();

        return response()->json([
            'success' => true,
            'data' => $sortedData,
        ]);
    }

    /**
     * Memulihkan data dari Trash berdasarkan modul, resource, dan ID.
     */
    public function restore($module, $resource, $id)
    {
        $modelClass = $this->resolveModelClass($module, $resource);
        $item = $modelClass::onlyTrashed()->findOrFail($id);
        $item->restore();

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil dipulihkan.',
            'data' => $item
        ]);
    }

    /**
     * Menghapus data secara permanen berdasarkan modul, resource, dan ID.
     */
    public function forceDelete($module, $resource, $id)
    {
        $modelClass = $this->resolveModelClass($module, $resource);
        $item = $modelClass::onlyTrashed()->findOrFail($id);
        $item->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil dihapus secara permanen.'
        ]);
    }
}