<?php

namespace Modules\RBAC\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Menampilkan permission yang dikelompokkan berdasarkan domain.
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
                    'name' => str($domain)->headline()->toString(),
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
     * Menyimpan permission baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/',
            ],
            'guard_name' => [
                'nullable',
                'string',
                'max:255',
            ],
        ], [
            'name.required' => 'Nama permission wajib diisi.',
            'name.regex' => 'Format permission harus menggunakan domain.nama, contoh: hrd.user.create.',
        ]);

        $guardName = $validated['guard_name'] ?? 'web';

        $exists = Permission::query()
            ->where('name', $validated['name'])
            ->where('guard_name', $guardName)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Permission tersebut sudah ada.',
            ], 422);
        }

        $permission = Permission::create([
            'name' => $validated['name'],
            'guard_name' => $guardName,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil dibuat.',
            'data' => $permission,
        ], 201);
    }

    /**
     * Menampilkan satu permission.
     */
    public function show(Permission $permission): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil diambil.',
            'data' => $permission,
        ]);
    }

    /**
     * Memperbarui permission.
     */
    public function update(
        Request $request,
        Permission $permission
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/',
                Rule::unique('permissions', 'name')
                    ->ignore($permission->id)
                    ->where(function ($query) use ($request) {
                        return $query->where(
                            'guard_name',
                            $request->input('guard_name', 'web')
                        );
                    }),
            ],
            'guard_name' => [
                'nullable',
                'string',
                'max:255',
            ],
        ], [
            'name.required' => 'Nama permission wajib diisi.',
            'name.unique' => 'Permission tersebut sudah ada.',
            'name.regex' => 'Format permission harus menggunakan domain.nama, contoh: hrd.user.create.',
        ]);

        $permission->update([
            'name' => $validated['name'],
            'guard_name' => $validated['guard_name']
                ?? $permission->guard_name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil diperbarui.',
            'data' => $permission->fresh(),
        ]);
    }

    /**
     * Menghapus permission.
     */
    public function destroy(Permission $permission): JsonResponse
    {
        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil dihapus.',
        ]);
    }
}