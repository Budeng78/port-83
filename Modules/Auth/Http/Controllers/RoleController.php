<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Auth\Http\Requests\RoleRequest;
use Spatie\Permission\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * Menampilkan daftar semua role beserta permissions-nya.
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar role berhasil diambil.',
            'data' => $roles,
        ]);
    }

    /**
     * Menyimpan role baru ke database.
     */
    public function store(RoleRequest $request): JsonResponse
    {
        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dibuat.',
            'data' => $role->load('permissions'),
        ], 201);
    }

    /**
     * Menampilkan detail spesifik sebuah role.
     */
    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail role berhasil diambil.',
            'data' => $role->load('permissions'),
        ]);
    }

    /**
     * Memperbarui data role yang sudah ada.
     */
    public function update(RoleRequest $request, Role $role): JsonResponse
    {
        // Melindungi role utama agar tidak diubah namanya secara sembarangan jika diperlukan
        if ($role->name === 'Super Admin' && $request->name !== 'Super Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Nama role Super Admin tidak dapat diubah.',
            ], 422);
        }

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        } else {
            $role->syncPermissions([]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil diperbarui.',
            'data' => $role->load('permissions'),
        ]);
    }

    /**
     * Menghapus role dari database.
     */
    public function destroy(Role $role): JsonResponse
    {
        if ($role->name === 'Super Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Role Super Admin tidak dapat dihapus.',
            ], 422);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dihapus.',
        ]);
    }
}