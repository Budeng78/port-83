<?php

namespace Modules\Platform\RBAC\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Platform\RBAC\Http\Requests\RoleRequest;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Menampilkan seluruh role.
     */
    public function index(): JsonResponse
    {
        $roles = Role::query()
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar role berhasil diambil.',
            'data' => $roles,
        ]);
    }

    /**
     * Membuat role baru.
     */
    public function store(RoleRequest $request): JsonResponse
    {
        $role = Role::create([
            'name' => $request->name,
            'guard_name' => $request->guard_name ?? 'web',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dibuat.',
            'data' => $role,
        ], 201);
    }

    /**
     * Menampilkan detail role.
     */
    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail role berhasil diambil.',
            'data' => $role,
        ]);
    }

    /**
     * Memperbarui role.
     */
    public function update(
        RoleRequest $request,
        Role $role
    ): JsonResponse {
        if (
            $role->name === 'Super Admin' &&
            $request->name !== 'Super Admin'
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Nama role Super Admin tidak dapat diubah.',
            ], 422);
        }

        $role->update([
            'name' => $request->name,
            'guard_name' => $request->guard_name ?? $role->guard_name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil diperbarui.',
            'data' => $role->fresh(),
        ]);
    }

    /**
     * Menghapus role.
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

    /**
     * Menampilkan permission yang dimiliki role.
     */
    public function permissions(Role $role): JsonResponse
    {
        $permissions = $role->permissions()
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Permission role berhasil diambil.',
            'data' => $permissions,
        ]);
    }

    /**
     * Menampilkan seluruh permission yang tersedia
     * untuk role beserta status assignment-nya.
     */
    public function availablePermissions(Role $role): JsonResponse
    {
        $permissions = Permission::query()
            ->where('guard_name', $role->guard_name)
            ->orderBy('name')
            ->get();

        $assignedPermissionIds = $role->permissions()
            ->pluck('id')
            ->toArray();

        $data = $permissions->map(function ($permission) use ($assignedPermissionIds) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'guard_name' => $permission->guard_name,
                'assigned' => in_array(
                    $permission->id,
                    $assignedPermissionIds
                ),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar permission berhasil diambil.',
            'data' => $data,
        ]);
    }

    /**
     * Menyimpan/sinkronisasi permission role.
     */
    public function syncPermissions(
        RoleRequest $request,
        Role $role
    ): JsonResponse {
        $permissions = $request->input('permissions', []);

        $role->syncPermissions($permissions);

        return response()->json([
            'success' => true,
            'message' => 'Permission role berhasil diperbarui.',
            'data' => [
                'role' => $role->fresh(),
                'permissions' => $role->permissions()
                    ->orderBy('name')
                    ->get(),
            ],
        ]);
    }
}