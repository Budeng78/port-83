<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class MatrixController extends Controller
{
    /**
     * Menampilkan data matriks (Roles, Permissions, dan Mapping relasinya).
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return response()->json([
            'success' => true,
            'message' => 'Data matriks hak akses berhasil diambil.',
            'data' => [
                'roles' => $roles,
                'permissions' => $permissions,
            ],
        ]);
    }

    /**
     * Memperbarui matriks hak akses secara massal (bulk sync).
     * Payload yang diharapkan: 
     * {
     *   "matrix": {
     *     "role_id_1": ["permission_name_1", "permission_name_2"],
     *     "role_id_2": ["permission_name_1"]
     *   }
     * }
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'matrix' => 'required|array',
            'matrix.*' => 'array',
            'matrix.*.*' => 'string|exists:permissions,name',
        ]);

        foreach ($request->matrix as $roleId => $permissionNames) {
            $role = Role::find($roleId);
            
            if ($role) {
                // Lindungi Super Admin agar tidak kehilangan akses secara tidak sengaja
                if ($role->name === 'Super Admin') {
                    continue; 
                }

                $role->syncPermissions($permissionNames);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Matriks hak akses berhasil diperbarui.',
        ]);
    }
}