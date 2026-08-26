<?php

namespace Modules\Platform\RBAC\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Platform\RBAC\Models\OrganizationUnit;

class OrganizationUnitController
{
    /**
     * =========================================================
     * INDEX
     * =========================================================
     *
     * GET /api/organization-units
     */
    public function index(Request $request): JsonResponse
    {
        $query = OrganizationUnit::query()
            ->with('parent:id,code,name')
            ->orderBy('sort_order')
            ->orderBy('name');

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = $request
                ->string('search')
                ->trim()
                ->toString();

            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER ACTIVE
        |--------------------------------------------------------------------------
        */

        if ($request->has('is_active')) {
            $query->where(
                'is_active',
                filter_var(
                    $request->input('is_active'),
                    FILTER_VALIDATE_BOOLEAN
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER PARENT
        |--------------------------------------------------------------------------
        */

        if ($request->filled('parent_id')) {
            $query->where(
                'parent_id',
                $request->input('parent_id')
            );
        }

        $units = $query->get();

        return response()->json([
            'success' => true,

            'data' => $units->map(
                function (OrganizationUnit $unit) {
                    return [
                        'id' => $unit->id,
                        'parent_id' => $unit->parent_id,

                        'parent' => $unit->parent
                            ? [
                                'id' => $unit->parent->id,
                                'code' => $unit->parent->code,
                                'name' => $unit->parent->name,
                            ]
                            : null,

                        'code' => $unit->code,
                        'name' => $unit->name,
                        'type' => $unit->type,
                        'description' => $unit->description,
                        'sort_order' => $unit->sort_order,
                        'is_active' => (bool) $unit->is_active,
                    ];
                }
            )->values(),
        ]);
    }


    /**
     * =========================================================
     * STORE
     * =========================================================
     *
     * POST /api/organization-units
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'parent_id' => [
                'nullable',
                'uuid',
                'exists:organization_units,id',
            ],

            'code' => [
                'required',
                'string',
                'max:100',
            ],

            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'type' => [
                'nullable',
                'string',
                'max:100',
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
                'nullable',
                'boolean',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | NORMALIZE
        |--------------------------------------------------------------------------
        */

        $validated['code'] = trim(
            $validated['code']
        );

        $validated['name'] = trim(
            $validated['name']
        );

        $validated['is_active'] =
            $validated['is_active'] ?? true;

        $validated['sort_order'] =
            $validated['sort_order'] ?? 0;

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        $unit = OrganizationUnit::create(
            $validated
        );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Organization Unit berhasil ditambahkan.',

            'data' => $unit->fresh([
                'parent:id,code,name',
            ]),
        ], 201);
    }


    /**
     * =========================================================
     * SHOW
     * =========================================================
     *
     * GET /api/organization-units/{organization_unit}
     */
    public function show(
        OrganizationUnit $organizationUnit
    ): JsonResponse {
        $organizationUnit->load([
            'parent:id,code,name',
            'children:id,parent_id,code,name,type,sort_order,is_active',
        ]);

        return response()->json([
            'success' => true,

            'data' => [
                'id' => $organizationUnit->id,
                'parent_id' => $organizationUnit->parent_id,

                'parent' => $organizationUnit->parent
                    ? [
                        'id' =>
                            $organizationUnit->parent->id,
                        'code' =>
                            $organizationUnit->parent->code,
                        'name' =>
                            $organizationUnit->parent->name,
                    ]
                    : null,

                'code' => $organizationUnit->code,
                'name' => $organizationUnit->name,
                'type' => $organizationUnit->type,
                'description' =>
                    $organizationUnit->description,
                'sort_order' =>
                    $organizationUnit->sort_order,
                'is_active' =>
                    (bool) $organizationUnit->is_active,

                'children' =>
                    $organizationUnit->children,
            ],
        ]);
    }


    /**
     * =========================================================
     * UPDATE
     * =========================================================
     *
     * PUT/PATCH /api/organization-units/{organization_unit}
     */
    public function update(
        Request $request,
        OrganizationUnit $organizationUnit
    ): JsonResponse {
        $validated = $request->validate([
            'parent_id' => [
                'nullable',
                'uuid',
                'exists:organization_units,id',
            ],

            'code' => [
                'required',
                'string',
                'max:100',
            ],

            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'type' => [
                'nullable',
                'string',
                'max:100',
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
                'nullable',
                'boolean',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | PREVENT SELF PARENT
        |--------------------------------------------------------------------------
        */

        if (
            isset($validated['parent_id']) &&
            $validated['parent_id'] === $organizationUnit->id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Organization Unit tidak dapat menjadi parent dirinya sendiri.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | NORMALIZE
        |--------------------------------------------------------------------------
        */

        $validated['code'] = trim(
            $validated['code']
        );

        $validated['name'] = trim(
            $validated['name']
        );

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $organizationUnit->update(
            $validated
        );

        return response()->json([
            'success' => true,

            'message' =>
                'Organization Unit berhasil diperbarui.',

            'data' => $organizationUnit->fresh([
                'parent:id,code,name',
            ]),
        ]);
    }


    /**
     * =========================================================
     * DESTROY
     * =========================================================
     *
     * DELETE /api/organization-units/{organization_unit}
     */
    public function destroy(
        OrganizationUnit $organizationUnit
    ): JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | CHECK CHILDREN
        |--------------------------------------------------------------------------
        */

        if (
            $organizationUnit
                ->children()
                ->exists()
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'Organization Unit tidak dapat dihapus karena masih memiliki child unit.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK ASSIGNMENT
        |--------------------------------------------------------------------------
        */

        if (
            $organizationUnit
                ->assignments()
                ->exists()
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'Organization Unit tidak dapat dihapus karena masih digunakan oleh assignment.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | DELETE
        |--------------------------------------------------------------------------
        */

        $organizationUnit->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'Organization Unit berhasil dihapus.',
        ]);
    }
}