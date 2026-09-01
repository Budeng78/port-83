<?php

namespace Modules\Platform\RBAC\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Platform\Auth\Models\User;
use Modules\Platform\RBAC\Models\UserAssignment;

class UserAssignmentController
{
    /**
     * =========================================================
     * INDEX
     * =========================================================
     *
     * Menampilkan user beserta seluruh assignment-nya.
     *
     * =========================================================
     *
     * KONSEP:
     *
     * 1 ROW = 1 USER
     *
     * Contoh:
     *
     * User A
     * ├── Primary
     * └── Secondary
     *
     * User B
     * ├── Primary
     * └── Secondary
     *
     * Pagination juga berdasarkan USER,
     * bukan berdasarkan assignment.
     *
     * GET /api/assignments
     *
     * Query:
     *
     * ?search=
     * ?user_id=
     * ?organization_unit_id=
     * ?organization_level_id=
     * ?is_active=
     * ?is_primary=
     * ?page=
     * ?per_page=
     */
    public function index(Request $request): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | BASE QUERY USER
        |--------------------------------------------------------------------------
        |
        | Pagination dilakukan pada User.
        |
        */

        $query = User::query()
            ->with([
                'assignments' => function ($assignmentQuery) {

                    $assignmentQuery
                        ->with([
                            'organizationUnit',
                            'organizationLevel',
                        ])
                        ->orderByDesc('is_primary')
                        ->orderByDesc('is_active')
                        ->orderBy('created_at');
                },
            ]);

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        |
        | Search berdasarkan:
        |
        | - User name
        | - User email
        | - Organization Unit code
        | - Organization Unit name
        | - Organization Level code
        | - Organization Level name
        |
        */

        if ($request->filled('search')) {

            $search = $request
                ->string('search')
                ->trim()
                ->toString();

            $query->where(function ($q) use ($search) {

                /*
                |--------------------------------------------------------------
                | USER
                |--------------------------------------------------------------
                */

                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");

                /*
                |--------------------------------------------------------------
                | ASSIGNMENT
                |--------------------------------------------------------------
                */

                $q->orWhereHas(
                    'assignments',
                    function ($assignmentQuery) use ($search) {

                        $assignmentQuery->where(function ($assignment) use ($search) {

                            /*
                            |--------------------------------------------------
                            | ORGANIZATION UNIT
                            |--------------------------------------------------
                            */

                            $assignment->whereHas(
                                'organizationUnit',
                                function ($unitQuery) use ($search) {

                                    $unitQuery
                                        ->where(
                                            'code',
                                            'like',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'name',
                                            'like',
                                            "%{$search}%"
                                        );
                                }
                            )

                            /*
                            |--------------------------------------------------
                            | ORGANIZATION LEVEL
                            |--------------------------------------------------
                            */

                            ->orWhereHas(
                                'organizationLevel',
                                function ($levelQuery) use ($search) {

                                    $levelQuery
                                        ->where(
                                            'code',
                                            'like',
                                            "%{$search}%"
                                        )
                                        ->orWhere(
                                            'name',
                                            'like',
                                            "%{$search}%"
                                        );
                                }
                            );
                        });
                    }
                );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER USER
        |--------------------------------------------------------------------------
        */

        if ($request->filled('user_id')) {

            $query->where(
                'id',
                $request->input('user_id')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER ORGANIZATION UNIT
        |--------------------------------------------------------------------------
        */

        if ($request->filled('organization_unit_id')) {

            $query->whereHas(
                'assignments',
                function ($assignmentQuery) use ($request) {

                    $assignmentQuery->where(
                        'organization_unit_id',
                        $request->input(
                            'organization_unit_id'
                        )
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER ORGANIZATION LEVEL
        |--------------------------------------------------------------------------
        */

        if ($request->filled('organization_level_id')) {

            $query->whereHas(
                'assignments',
                function ($assignmentQuery) use ($request) {

                    $assignmentQuery->where(
                        'organization_level_id',
                        $request->input(
                            'organization_level_id'
                        )
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER ACTIVE
        |--------------------------------------------------------------------------
        |
        | Filter user berdasarkan assignment aktif.
        |
        */

        if ($request->filled('is_active')) {

            $isActive = filter_var(
                $request->input('is_active'),
                FILTER_VALIDATE_BOOLEAN
            );

            $query->whereHas(
                'assignments',
                function ($assignmentQuery) use ($isActive) {

                    $assignmentQuery->where(
                        'is_active',
                        $isActive
                    );
                }
            );
        }
        /*
        |--------------------------------------------------------------------------
        | FILTER PRIMARY
        |--------------------------------------------------------------------------
        |
        | Filter user yang mempunyai assignment:
        |
        | is_primary = true / false
        |
        */

        if ($request->filled('is_primary')) {

            $isPrimary = filter_var(
                $request->input('is_primary'),
                FILTER_VALIDATE_BOOLEAN
            );

            $query->whereHas(
                'assignments',
                function ($assignmentQuery) use ($isPrimary) {

                    $assignmentQuery->where(
                        'is_primary',
                        $isPrimary
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ORDER USER
        |--------------------------------------------------------------------------
        |
        | Urutan utama berdasarkan nama user.
        |
        | Assignment tetap diurutkan:
        |
        | Primary
        | Active
        | Created
        |
        */

        $query->orderBy('name');

        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        |
        | PENTING:
        |
        | Pagination dilakukan pada USER.
        |
        | Jadi:
        |
        | per_page = 15
        |
        | berarti:
        |
        | 15 USER
        |
        | bukan:
        |
        | 15 ASSIGNMENT.
        |
        */

        $perPage = min(
            max(
                (int) $request->input(
                    'per_page',
                    15
                ),
                1
            ),
            100
        );

        $users = $query->paginate(
            $perPage
        );

        /*
        |--------------------------------------------------------------------------
        | FORMAT RESPONSE
        |--------------------------------------------------------------------------
        */

        $data = $users
            ->getCollection()
            ->map(function (User $user) {

                return $this->formatUser(
                    $user
                );
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'data' => $data,

            'meta' => [

                'current_page' =>
                    $users->currentPage(),

                'last_page' =>
                    $users->lastPage(),

                'per_page' =>
                    $users->perPage(),

                'total' =>
                    $users->total(),

            ],

        ]);
    }


    /**
     * =========================================================
     * STORE
     * =========================================================
     *
     * Membuat assignment baru untuk user.
     *
     * POST /api/assignments
     */
    public function store(
        Request $request
    ): JsonResponse {

        $validated = $request->validate([

            'user_id' => [
                'required',
                'exists:users,id',
            ],

            'organization_unit_id' => [
                'required',
                'exists:organization_units,id',
            ],

            'organization_level_id' => [
                'required',
                'exists:organization_levels,id',
            ],

            'is_primary' => [
                'sometimes',
                'boolean',
            ],

            'starts_at' => [
                'nullable',
                'date',
            ],

            'ends_at' => [
                'nullable',
                'date',
                'after_or_equal:starts_at',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],

        ]);

        /*
        |--------------------------------------------------------------------------
        | DEFAULT
        |--------------------------------------------------------------------------
        */

        $validated['is_primary'] =
            $validated['is_primary'] ?? false;

        $validated['is_active'] =
            $validated['is_active'] ?? true;

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        |
        | Satu user hanya boleh mempunyai satu
        | assignment primary.
        |
        */

        $assignment = DB::transaction(
            function () use ($validated) {

                if (
                    $validated['is_primary']
                ) {

                    UserAssignment::where(
                        'user_id',
                        $validated['user_id']
                    )->update([
                        'is_primary' => false,
                    ]);
                }

                return UserAssignment::create(
                    $validated
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONS
        |--------------------------------------------------------------------------
        */

        $assignment->load([
            'user',
            'organizationUnit',
            'organizationLevel',
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' =>
                'User assignment berhasil ditambahkan.',

            'data' =>
                $this->formatAssignment(
                    $assignment
                ),

        ], 201);
    }


    /**
     * =========================================================
     * SHOW
     * =========================================================
     *
     * Menampilkan detail satu assignment.
     *
     * GET /api/assignments/{assignment}
     */
    public function show(
        UserAssignment $assignment
    ): JsonResponse {

        $assignment->load([
            'user',
            'organizationUnit',
            'organizationLevel',
        ]);

        return response()->json([

            'success' => true,

            'data' =>
                $this->formatAssignment(
                    $assignment
                ),

        ]);
    }


    /**
     * =========================================================
     * UPDATE
     * =========================================================
     *
     * User tidak dapat dipindahkan ketika edit assignment.
     *
     * PUT/PATCH /api/assignments/{assignment}
     */
    public function update(
        Request $request,
        UserAssignment $assignment
    ): JsonResponse {

        $validated = $request->validate([

            'organization_unit_id' => [
                'required',
                'exists:organization_units,id',
            ],

            'organization_level_id' => [
                'required',
                'exists:organization_levels,id',
            ],

            'is_primary' => [
                'sometimes',
                'boolean',
            ],

            'starts_at' => [
                'nullable',
                'date',
            ],

            'ends_at' => [
                'nullable',
                'date',
                'after_or_equal:starts_at',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],

        ]);

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $validated,
                $assignment
            ) {

                /*
                |--------------------------------------------------------------
                | PRIMARY
                |--------------------------------------------------------------
                */

                if (
                    isset(
                        $validated['is_primary']
                    ) &&
                    $validated['is_primary']
                ) {

                    UserAssignment::where(
                        'user_id',
                        $assignment->user_id
                    )
                        ->where(
                            'id',
                            '!=',
                            $assignment->id
                        )
                        ->update([
                            'is_primary' => false,
                        ]);
                }

                /*
                |--------------------------------------------------------------
                | UPDATE ASSIGNMENT
                |--------------------------------------------------------------
                */

                $assignment->update(
                    $validated
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONS
        |--------------------------------------------------------------------------
        */

        $assignment->load([
            'user',
            'organizationUnit',
            'organizationLevel',
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' =>
                'User assignment berhasil diperbarui.',

            'data' =>
                $this->formatAssignment(
                    $assignment
                ),

        ]);
    }


    /**
     * =========================================================
     * DESTROY
     * =========================================================
     *
     * DELETE /api/assignments/{assignment}
     */
    public function destroy(
        UserAssignment $assignment
    ): JsonResponse {

        $assignment->delete();

        return response()->json([

            'success' => true,

            'message' =>
                'User assignment berhasil dihapus.',

        ]);
    }


    /**
     * =========================================================
     * FORMAT USER
     * =========================================================
     *
     * 1 row = 1 user.
     *
     * Assignment dipisahkan menjadi:
     *
     * - primary
     * - secondary
     * - assignments
     */
    protected function formatUser(
        User $user
    ): array {

        $assignments = $user
            ->assignments
            ->values();

        /*
        |--------------------------------------------------------------------------
        | PRIMARY
        |--------------------------------------------------------------------------
        */

        $primary = $assignments
            ->firstWhere(
                'is_primary',
                true
            );

        /*
        |--------------------------------------------------------------------------
        | SECONDARY
        |--------------------------------------------------------------------------
        */

        $secondary = $assignments
            ->where(
                'is_primary',
                false
            )
            ->values();

        return [

            /*
            |------------------------------------------------------------------
            | USER
            |------------------------------------------------------------------
            */

            'user' => [

                'id' =>
                    $user->id,

                'name' =>
                    $user->name,

                'email' =>
                    $user->email,

            ],

            /*
            |------------------------------------------------------------------
            | PRIMARY ASSIGNMENT
            |------------------------------------------------------------------
            */

            'primary' => $primary
                ? $this->formatAssignment(
                    $primary
                )
                : null,

            /*
            |------------------------------------------------------------------
            | SECONDARY ASSIGNMENTS
            |------------------------------------------------------------------
            */

            'secondary' => $secondary
                ->map(
                    fn (
                        UserAssignment $assignment
                    ) =>
                        $this->formatAssignment(
                            $assignment
                        )
                )
                ->values()
                ->all(),

            /*
            |------------------------------------------------------------------
            | ALL ASSIGNMENTS
            |------------------------------------------------------------------
            |
            | Tetap disediakan agar frontend dapat memilih
            | struktur flat jika diperlukan.
            |
            */

            'assignments' => $assignments
                ->map(
                    fn (
                        UserAssignment $assignment
                    ) =>
                        $this->formatAssignment(
                            $assignment
                        )
                )
                ->values()
                ->all(),

        ];
    }


    /**
     * =========================================================
     * FORMAT ASSIGNMENT
     * =========================================================
     *
     * Standarisasi object assignment.
     */
    protected function formatAssignment(
        UserAssignment $assignment
    ): array {

        return [

            /*
            |------------------------------------------------------------------
            | ID
            |------------------------------------------------------------------
            */

            'id' =>
                $assignment->id,

            /*
            |------------------------------------------------------------------
            | FOREIGN KEYS
            |------------------------------------------------------------------
            */

            'user_id' =>
                $assignment->user_id,

            'organization_unit_id' =>
                $assignment->organization_unit_id,

            'organization_level_id' =>
                $assignment->organization_level_id,

            /*
            |------------------------------------------------------------------
            | ORGANIZATION UNIT
            |------------------------------------------------------------------
            */

            'organization_unit' => [

                'id' =>
                    $assignment
                        ->organizationUnit?->id,

                'code' =>
                    $assignment
                        ->organizationUnit?->code,

                'name' =>
                    $assignment
                        ->organizationUnit?->name,

                'type' =>
                    $assignment
                        ->organizationUnit?->type,

            ],

            /*
            |------------------------------------------------------------------
            | ORGANIZATION LEVEL
            |------------------------------------------------------------------
            */

            'organization_level' => [

                'id' =>
                    $assignment
                        ->organizationLevel?->id,

                'code' =>
                    $assignment
                        ->organizationLevel?->code,

                'name' =>
                    $assignment
                        ->organizationLevel?->name,

            ],

            /*
            |------------------------------------------------------------------
            | STATUS ASSIGNMENT
            |------------------------------------------------------------------
            */

            'is_primary' =>
                (bool) $assignment->is_primary,

            'is_active' =>
                (bool) $assignment->is_active,

            /*
            |------------------------------------------------------------------
            | PERIOD
            |------------------------------------------------------------------
            */

            'starts_at' =>
                $assignment->starts_at,

            'ends_at' =>
                $assignment->ends_at,

            /*
            |------------------------------------------------------------------
            | TIMESTAMPS
            |------------------------------------------------------------------
            */

            'created_at' =>
                $assignment->created_at,

            'updated_at' =>
                $assignment->updated_at,

        ];
    }
}