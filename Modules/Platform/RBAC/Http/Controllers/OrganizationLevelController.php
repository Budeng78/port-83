<?php

namespace Modules\Platform\RBAC\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Platform\RBAC\Models\OrganizationLevel;

class OrganizationLevelController
{
    public function index(Request $request): JsonResponse
    {
        $query = OrganizationLevel::query()
            ->with([
                'parent:id,code,name',
            ])
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($request->filled('search')) {
            $search = $request
                ->string('search')
                ->trim()
                ->toString();

            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where(
                'is_active',
                filter_var(
                    $request->input('is_active'),
                    FILTER_VALIDATE_BOOLEAN
                )
            );
        }

        $levels = $query->get();

        return response()->json([
            'success' => true,
            'data' => $levels->map(function (OrganizationLevel $level) {
                return [
                    'id' => $level->id,
                    'parent_id' => $level->parent_id,

                    'parent' => $level->parent
                        ? [
                            'id' => $level->parent->id,
                            'code' => $level->parent->code,
                            'name' => $level->parent->name,
                        ]
                        : null,

                    'code' => $level->code,
                    'name' => $level->name,
                    'description' => $level->description,
                    'sort_order' => $level->sort_order,
                    'is_active' => (bool) $level->is_active,
                ];
            })->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'parent_id' => [
                'nullable',
                'uuid',
                'exists:organization_levels,id',
            ],
            'code' => [
                'required',
                'string',
                'max:100',
                'unique:organization_levels,code',
            ],
            'name' => [
                'required',
                'string',
                'max:150',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'sort_order' => [
                'nullable',
                'integer',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $validated['is_active'] ??= true;

        $level = OrganizationLevel::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Organization level berhasil dibuat.',
            'data' => $level->load('parent:id,code,name'),
        ], 201);
    }

    public function show(
        OrganizationLevel $organizationLevel
    ): JsonResponse {
        $organizationLevel->load('parent:id,code,name');

        return response()->json([
            'success' => true,
            'data' => $organizationLevel,
        ]);
    }

    public function update(
        Request $request,
        OrganizationLevel $organizationLevel
    ): JsonResponse {
        $validated = $request->validate([
            'parent_id' => [
                'nullable',
                'uuid',
                'exists:organization_levels,id',
                'not_in:' . $organizationLevel->id,
            ],
            'code' => [
                'required',
                'string',
                'max:100',
                'unique:organization_levels,code,' . $organizationLevel->id,
            ],
            'name' => [
                'required',
                'string',
                'max:150',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'sort_order' => [
                'nullable',
                'integer',
            ],
            'is_active' => [
                'boolean',
            ],
        ]);

        $organizationLevel->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Organization level berhasil diperbarui.',
            'data' => $organizationLevel->fresh()->load(
                'parent:id,code,name'
            ),
        ]);
    }

    public function destroy(
        OrganizationLevel $organizationLevel
    ): JsonResponse {
        if ($organizationLevel->children()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Organization level tidak dapat dihapus karena masih memiliki child.',
            ], 422);
        }

        if ($organizationLevel->assignments()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Organization level tidak dapat dihapus karena masih digunakan oleh assignment.',
            ], 422);
        }

        $organizationLevel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Organization level berhasil dihapus.',
        ]);
    }
}