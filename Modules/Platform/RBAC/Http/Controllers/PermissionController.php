<?php

namespace Modules\Platform\RBAC\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Platform\RBAC\Http\Requests\PermissionRequest;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * ============================================================
     * INDEX
     * ============================================================
     *
     * Menampilkan seluruh permission yang dikelompokkan
     * berdasarkan domain.
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'guard_name',
            ]);

        $domains = $permissions
            ->groupBy(function ($permission) {
                return explode('.', $permission->name)[0];
            })
            ->map(function ($items, $domain) {
                return [
                    'domain' => $domain,

                    'name' => str($domain)
                        ->headline()
                        ->toString(),

                    'permissions' => $items->values(),

                    'total' => $items->count(),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Daftar permission berhasil diambil.',
            'data' => $domains,
            'total' => $permissions->count(),
        ]);
    }


    /**
     * ============================================================
     * STORE
     * ============================================================
     *
     * Membuat permission baru.
     */
    public function store(
        PermissionRequest $request
    ): JsonResponse {

        $validated = $request->validated();

        $permission = Permission::create([
            'name' => $validated['name'],
            'guard_name' => $validated['guard_name'] ?? 'web',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil dibuat.',
            'data' => $permission,
        ], 201);
    }


    /**
     * ============================================================
     * SHOW
     * ============================================================
     */
    public function show(
        Permission $permission
    ): JsonResponse {

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil diambil.',
            'data' => $permission,
        ]);
    }


    /**
     * ============================================================
     * UPDATE
     * ============================================================
     *
     * Memperbarui permission.
     */
    public function update(
        PermissionRequest $request,
        Permission $permission
    ): JsonResponse {

        $validated = $request->validated();

        $permission->update([
            'name' => $validated['name'],

            'guard_name' =>
                $validated['guard_name']
                ?? $permission->guard_name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil diperbarui.',
            'data' => $permission->fresh(),
        ]);
    }


    /**
     * ============================================================
     * DESTROY
     * ============================================================
     *
     * Menghapus permission.
     */
    public function destroy(
        Permission $permission
    ): JsonResponse {

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil dihapus.',
        ]);
    }
}