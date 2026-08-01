<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    /**
     * Menampilkan daftar semua permission.
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::all();

        return response()->json([
            'success' => true,
            'message' => 'Daftar permission berhasil diambil.',
            'data' => $permissions,
        ]);
    }
}