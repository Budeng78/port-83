<?php
namespace Modules\System\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class ModuleController extends Controller
{
    // Mengambil daftar semua modul berdasarkan file module.json di direktori Modules/
    public function index()
    {
        $modulesPath = base_path('Modules');
        if (!File::exists($modulesPath)) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $directories = File::directories($modulesPath);
        $modules = [];

        foreach ($directories as $directory) {
            $jsonPath = $directory . '/module.json';
            
            if (File::exists($jsonPath)) {
                $content = File::get($jsonPath);
                $data = json_decode($content, true);
                
                if ($data) {
                    $data['folder_name'] = basename($directory);
                    $modules[] = $data;
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $modules
        ]);
    }

    // Mengubah status aktif/non-aktif (is_active) modul via alias-nya
    public function toggle(Request $request, $alias)
    {
        $modulesPath = base_path('Modules');
        $directories = File::directories($modulesPath);
        $targetModulePath = null;

        foreach ($directories as $directory) {
            $jsonPath = $directory . '/module.json';
            if (File::exists($jsonPath)) {
                $content = File::get($jsonPath);
                $data = json_decode($content, true);
                
                if (isset($data['alias']) && strtolower($data['alias']) === strtolower($alias)) {
                    $targetModulePath = $jsonPath;
                    break;
                }
            }
        }

        if (!$targetModulePath) {
            return response()->json([
                'status' => 'error',
                'message' => 'Modul tidak ditemukan.'
            ], 404);
        }

        $moduleData = json_decode(File::get($targetModulePath), true);
        
        // Balikkan status kebalikan dari sebelumnya
        $moduleData['is_active'] = !$moduleData['is_active'];

        File::put($targetModulePath, json_encode($moduleData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return response()->json([
            'status' => 'success',
            'message' => 'Status modul berhasil diperbarui.',
            'data' => $moduleData
        ]);
    }
}