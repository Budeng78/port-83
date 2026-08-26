<?php

namespace Modules\Platform\RBAC\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Platform\Auth\Models\User;
use Modules\Platform\RBAC\Models\UserAssignment;
use Modules\Platform\RBAC\Models\OrganizationUnit;
use Modules\Platform\RBAC\Models\OrganizationLevel;
use Modules\Platform\System\Models\Menu;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserMatrixController
{
    /**
     * =========================================================
     * INDEX / MATRIX
     * =========================================================
     *
     * Menampilkan seluruh user beserta:
     *
     * - System Roles
     * - Direct Permissions
     * - Effective Permissions
     * - Organization Assignments
     * - Menu Access
     *
     * Menu Access bersumber dari tabel user_menu.
     */
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with([
                'roles',
                'permissions',
                'assignments.organizationUnit',
                'assignments.organizationLevel',
            ])
            ->orderBy('name')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | MASTER ROLES
        |--------------------------------------------------------------------------
        */

        $roles = Role::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | MASTER PERMISSIONS
        |--------------------------------------------------------------------------
        */

        $permissions = Permission::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | MASTER ORGANIZATION UNITS
        |--------------------------------------------------------------------------
        */

        $organizationUnits = OrganizationUnit::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'code',
                'name',
                'type',
            ]);

        /*
        |--------------------------------------------------------------------------
        | MASTER ORGANIZATION LEVELS
        |--------------------------------------------------------------------------
        */

        $organizationLevels = OrganizationLevel::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'code',
                'name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | FORMAT USERS
        |--------------------------------------------------------------------------
        */

        $formattedUsers = $users
            ->map(function (User $user) {

                return [
                    'id' => $user->id,

                    'name' => $user->name,

                    'email' => $user->email,

                    /*
                    |--------------------------------------------------------------------------
                    | ROLES
                    |--------------------------------------------------------------------------
                    */

                    'roles' => $user->roles
                        ->map(function ($role) {

                            return [
                                'id' => $role->id,
                                'name' => $role->name,
                            ];

                        })
                        ->values(),

                    /*
                    |--------------------------------------------------------------------------
                    | DIRECT PERMISSIONS
                    |--------------------------------------------------------------------------
                    */

                    'direct_permissions' => $user
                        ->permissions
                        ->map(function ($permission) {

                            return [
                                'id' => $permission->id,
                                'name' => $permission->name,
                            ];

                        })
                        ->values(),

                    /*
                    |--------------------------------------------------------------------------
                    | EFFECTIVE PERMISSIONS
                    |--------------------------------------------------------------------------
                    */

                    'effective_permissions' => $user
                        ->getAllPermissions()
                        ->map(function ($permission) {

                            return [
                                'id' => $permission->id,
                                'name' => $permission->name,
                            ];

                        })
                        ->values(),

                    /*
                    |--------------------------------------------------------------------------
                    | ASSIGNMENTS
                    |--------------------------------------------------------------------------
                    */

                    'assignments' => $user
                        ->assignments
                        ->map(function ($assignment) {

                            return $this->formatAssignment(
                                $assignment
                            );

                        })
                        ->values(),

                    /*
                    |--------------------------------------------------------------------------
                    | MENU ACCESS
                    |--------------------------------------------------------------------------
                    */

                    'menu_access' => $this->getMenuAccess($user),
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'data' => [

                'users' => $formattedUsers,

                'roles' => $roles,

                'permissions' => $permissions,

                'organization_units' => $organizationUnits,

                'organization_levels' => $organizationLevels,
            ],
        ]);
    }


    /**
     * =========================================================
     * SHOW USER MATRIX
     * =========================================================
     */
    public function show(User $user): JsonResponse
    {
        $user->load([
            'assignments.organizationUnit',
            'assignments.organizationLevel',
            'roles',
            'permissions',
        ]);

        return response()->json([
            'success' => true,

            'data' => [

                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],

                /*
                |--------------------------------------------------------------------------
                | ROLES
                |--------------------------------------------------------------------------
                */

                'roles' => $user->roles
                    ->map(function ($role) {

                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                        ];

                    })
                    ->values(),

                /*
                |--------------------------------------------------------------------------
                | DIRECT PERMISSIONS
                |--------------------------------------------------------------------------
                */

                'direct_permissions' => $user
                    ->permissions
                    ->map(function ($permission) {

                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];

                    })
                    ->values(),

                /*
                |--------------------------------------------------------------------------
                | EFFECTIVE PERMISSIONS
                |--------------------------------------------------------------------------
                */

                'effective_permissions' => $user
                    ->getAllPermissions()
                    ->map(function ($permission) {

                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                        ];

                    })
                    ->values(),

                /*
                |--------------------------------------------------------------------------
                | ASSIGNMENTS
                |--------------------------------------------------------------------------
                */

                'assignments' => $user
                    ->assignments
                    ->map(function ($assignment) {

                        return $this->formatAssignment(
                            $assignment
                        );

                    })
                    ->values(),

                /*
                |--------------------------------------------------------------------------
                | MENU ACCESS
                |--------------------------------------------------------------------------
                */

                'menu_access' => $this->getMenuAccess($user),
            ],
        ]);
    }


    /**
     * =========================================================
     * STORE ROLE
     * =========================================================
     */
    public function storeRole(
        Request $request,
        User $user
    ): JsonResponse {

        $validated = $request->validate([
            'role_id' => [
                'required',
                'integer',
                'exists:roles,id',
            ],
        ]);

        $role = Role::query()
            ->findOrFail(
                $validated['role_id']
            );

        if (
            $user->roles()
                ->where('roles.id', $role->id)
                ->exists()
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Role tersebut sudah dimiliki user.',
            ], 422);
        }

        $user->assignRole($role);

        $user->load('roles');

        return response()->json([
            'success' => true,

            'message' =>
                'System Role berhasil ditambahkan.',

            'data' => [
                'role' => [
                    'id' => $role->id,
                    'name' => $role->name,
                ],
            ],
        ], 201);
    }


    /**
     * =========================================================
     * DESTROY ROLE
     * =========================================================
     */
    public function destroyRole(
        User $user,
        Role $role
    ): JsonResponse {

        if (
            !$user->roles()
                ->where('roles.id', $role->id)
                ->exists()
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Role tersebut tidak dimiliki user.',
            ], 422);
        }

        $user->removeRole($role);

        return response()->json([
            'success' => true,

            'message' =>
                'System Role berhasil dihapus.',
        ]);
    }


    /**
     * =========================================================
     * STORE DIRECT PERMISSION
     * =========================================================
     */
    public function storePermission(
        Request $request,
        User $user
    ): JsonResponse {

        $validated = $request->validate([
            'permission_id' => [
                'required',
                'integer',
                'exists:permissions,id',
            ],
        ]);

        $permission = Permission::query()
            ->findOrFail(
                $validated['permission_id']
            );

        if (
            $user->permissions()
                ->where(
                    'permissions.id',
                    $permission->id
                )
                ->exists()
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Direct Permission tersebut sudah dimiliki user.',
            ], 422);
        }

        $user->givePermissionTo(
            $permission
        );

        return response()->json([
            'success' => true,

            'message' =>
                'Direct Permission berhasil ditambahkan.',

            'data' => [
                'permission' => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                ],
            ],
        ], 201);
    }


    /**
     * =========================================================
     * DESTROY DIRECT PERMISSION
     * =========================================================
     */
    public function destroyPermission(
        User $user,
        Permission $permission
    ): JsonResponse {

        if (
            !$user->permissions()
                ->where(
                    'permissions.id',
                    $permission->id
                )
                ->exists()
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Direct Permission tersebut tidak dimiliki user.',
            ], 422);
        }

        $user->revokePermissionTo(
            $permission
        );

        return response()->json([
            'success' => true,

            'message' =>
                'Direct Permission berhasil dihapus.',
        ]);
    }


    /**
     * =========================================================
     * STORE ASSIGNMENT
     * =========================================================
     */
    public function storeAssignment(
        Request $request,
        User $user
    ): JsonResponse {

        $validated = $request->validate([

            'organization_unit_id' => [
                'required',
                'uuid',
                'exists:organization_units,id',
            ],

            'organization_level_id' => [
                'required',
                'uuid',
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

        $validated['user_id'] =
            $user->id;

        $validated['is_primary'] =
            $validated['is_primary'] ?? false;

        $validated['is_active'] =
            $validated['is_active'] ?? true;

        /*
        |--------------------------------------------------------------------------
        | DUPLICATE
        |--------------------------------------------------------------------------
        */

        $exists = UserAssignment::query()
            ->where(
                'user_id',
                $user->id
            )
            ->where(
                'organization_unit_id',
                $validated['organization_unit_id']
            )
            ->where(
                'organization_level_id',
                $validated['organization_level_id']
            )
            ->exists();

        if ($exists) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Assignment tersebut sudah dimiliki user.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | PRIMARY
        |--------------------------------------------------------------------------
        */

        if ($validated['is_primary']) {

            UserAssignment::query()
                ->where(
                    'user_id',
                    $user->id
                )
                ->update([
                    'is_primary' => false,
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        $assignment =
            UserAssignment::create(
                $validated
            );

        $assignment->load([
            'organizationUnit',
            'organizationLevel',
        ]);

        return response()->json([
            'success' => true,

            'message' =>
                'Assignment user berhasil ditambahkan.',

            'data' =>
                $this->formatAssignment(
                    $assignment
                ),
        ], 201);
    }


    /**
     * =========================================================
     * UPDATE ASSIGNMENT
     * =========================================================
     */
    public function updateAssignment(
        Request $request,
        User $user,
        UserAssignment $assignment
    ): JsonResponse {

        if (
            (string) $assignment->user_id !==
            (string) $user->id
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Assignment bukan milik user tersebut.',
            ], 422);
        }

        $validated = $request->validate([

            'organization_unit_id' => [
                'required',
                'uuid',
                'exists:organization_units,id',
            ],

            'organization_level_id' => [
                'required',
                'uuid',
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

        if (
            isset($validated['is_primary']) &&
            $validated['is_primary']
        ) {

            UserAssignment::query()
                ->where(
                    'user_id',
                    $user->id
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

        $assignment->update(
            $validated
        );

        $assignment->load([
            'organizationUnit',
            'organizationLevel',
        ]);

        return response()->json([
            'success' => true,

            'message' =>
                'Assignment user berhasil diperbarui.',

            'data' =>
                $this->formatAssignment(
                    $assignment
                ),
        ]);
    }


    /**
     * =========================================================
     * DESTROY ASSIGNMENT
     * =========================================================
     */
    public function destroyAssignment(
        User $user,
        UserAssignment $assignment
    ): JsonResponse {

        if (
            (string) $assignment->user_id !==
            (string) $user->id
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Assignment bukan milik user tersebut.',
            ], 422);
        }

        $assignment->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'Assignment user berhasil dihapus.',
        ]);
    }


    /**
     * =========================================================
     * FORMAT ASSIGNMENT
     * =========================================================
     */
    protected function formatAssignment(
        UserAssignment $assignment
    ): array {

        return [

            'id' =>
                $assignment->id,

            'name' =>
                $assignment->organizationUnit?->name
                ??
                $assignment->organizationLevel?->name
                ??
                'Assignment',

            'organization_unit' => [

                'id' =>
                    $assignment->organizationUnit?->id,

                'code' =>
                    $assignment->organizationUnit?->code,

                'name' =>
                    $assignment->organizationUnit?->name,

                'type' =>
                    $assignment->organizationUnit?->type,
            ],

            'organization_level' => [

                'id' =>
                    $assignment->organizationLevel?->id,

                'code' =>
                    $assignment->organizationLevel?->code,

                'name' =>
                    $assignment->organizationLevel?->name,
            ],

            'is_primary' =>
                (bool) $assignment->is_primary,

            'is_active' =>
                (bool) $assignment->is_active,

            'starts_at' =>
                $assignment->starts_at,

            'ends_at' =>
                $assignment->ends_at,
        ];
    }


    /**
     * =========================================================
     * MENU ACCESS
     * =========================================================
     *
     * SUMBER MENU USER:
     *
     *     user_menu
     *
     * BUKAN:
     *
     *     menus.is_active
     *
     * Artinya:
     *
     * user_menu
     *      ↓
     *   user_id
     *      ↓
     *   menu_id
     *      ↓
     *    menus
     *
     * Hanya record user_menu yang:
     *
     *     user_id = user
     *     is_active = 1
     *     deleted_at IS NULL
     *
     * yang ditampilkan.
     */
    protected function getMenuAccess(
        User $user
    ) {

        /*
        |--------------------------------------------------------------------------
        | USER_MENU
        |--------------------------------------------------------------------------
        |
        | Ambil menu berdasarkan assignment di user_menu.
        |
        */

        return Menu::query()
            ->select([
                'menus.id',
                'menus.parent_id',
                'menus.label',
                'menus.path',
                'menus.icon',
                'menus.permission_name',
                'menus.order',
            ])

            /*
            |--------------------------------------------------------------------------
            | JOIN USER_MENU
            |--------------------------------------------------------------------------
            */

            ->join(
                'user_menu',
                'user_menu.menu_id',
                '=',
                'menus.id'
            )

            /*
            |--------------------------------------------------------------------------
            | USER
            |--------------------------------------------------------------------------
            */

            ->where(
                'user_menu.user_id',
                $user->id
            )

            /*
            |--------------------------------------------------------------------------
            | USER MENU ACTIVE
            |--------------------------------------------------------------------------
            */

            ->where(
                'user_menu.is_active',
                true
            )

            /*
            |--------------------------------------------------------------------------
            | USER MENU NOT DELETED
            |--------------------------------------------------------------------------
            */

            ->whereNull(
                'user_menu.deleted_at'
            )

            /*
            |--------------------------------------------------------------------------
            | MENU NOT DELETED
            |--------------------------------------------------------------------------
            */

            ->whereNull(
                'menus.deleted_at'
            )

            /*
            |--------------------------------------------------------------------------
            | ORDER
            |--------------------------------------------------------------------------
            */

            ->orderBy(
                'menus.order'
            )

            ->get()

            ->map(function ($menu) {

                return [

                    'id' =>
                        $menu->id,

                    'parent_id' =>
                        $menu->parent_id,

                    'label' =>
                        $menu->label,

                    'path' =>
                        $menu->path,

                    'icon' =>
                        $menu->icon,

                    'permission_name' =>
                        $menu->permission_name,

                    'order' =>
                        $menu->order,

                    /*
                    |--------------------------------------------------------------------------
                    | ACCESS TYPE
                    |--------------------------------------------------------------------------
                    |
                    | Saat ini sumber akses adalah user_menu.
                    |
                    */

                    'access_type' =>
                        'user_menu',
                ];
            })

            ->values();
    }


    /**
     * =========================================================
     * USERS
     * =========================================================
     */
    public function users(): JsonResponse
    {
        $users = User::query()
            ->with([
                'roles',
                'permissions',
                'assignments.organizationUnit',
                'assignments.organizationLevel',
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,

            'data' => [

                'users' => $users
                    ->map(function (User $user) {

                        return [

                            'id' =>
                                $user->id,

                            'name' =>
                                $user->name,

                            'email' =>
                                $user->email,

                            'roles' =>
                                $user->roles
                                    ->map(function ($role) {

                                        return [
                                            'id' => $role->id,
                                            'name' => $role->name,
                                        ];

                                    })
                                    ->values(),

                            'direct_permissions' =>
                                $user->permissions
                                    ->map(function ($permission) {

                                        return [
                                            'id' => $permission->id,
                                            'name' => $permission->name,
                                        ];

                                    })
                                    ->values(),

                            'assignments' =>
                                $user->assignments
                                    ->map(function ($assignment) {

                                        return $this->formatAssignment(
                                            $assignment
                                        );

                                    })
                                    ->values(),

                            'menu_access' =>
                                $this->getMenuAccess(
                                    $user
                                ),
                        ];

                    })
                    ->values(),

                /*
                |--------------------------------------------------------------------------
                | MASTER DATA
                |--------------------------------------------------------------------------
                */

                'roles' => Role::query()
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                    ]),

                'permissions' => Permission::query()
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                    ]),

                'organization_units' =>
                    OrganizationUnit::query()
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->get([
                            'id',
                            'code',
                            'name',
                            'type',
                        ]),

                'organization_levels' =>
                    OrganizationLevel::query()
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->get([
                            'id',
                            'code',
                            'name',
                        ]),
            ],
        ]);
    }


    /**
     * =========================================================
     * USER MENU ACCESS
     * =========================================================
     *
     * Menampilkan menu yang memang sudah diberikan
     * kepada user melalui tabel user_menu.
     */
    public function menus(User $user): JsonResponse
    {
        return response()->json([
            'success' => true,

            'data' => [

                'user' => [
                    'id' =>
                        $user->id,

                    'name' =>
                        $user->name,

                    'email' =>
                        $user->email,
                ],

                'menus' =>
                    $this->getMenuAccess(
                        $user
                    ),
            ],
        ]);
    }


/**
 * =========================================================
 * UPDATE MENU ACCESS
 * =========================================================
 *
 * Menyimpan Menu Access user ke tabel user_menu.
 *
 * Sumber kebenaran:
 *
 * user_menu
 *   user_id
 *   menu_id
 *   is_active
 *
 * Request:
 *
 * {
 *     "menu_ids": [
 *         "uuid-menu-1",
 *         "uuid-menu-2"
 *     ]
 * }
 */
public function updateMenus(
    Request $request,
    User $user
): JsonResponse {

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    $validated = $request->validate([

        'menu_ids' => [
            'required',
            'array',
        ],

        'menu_ids.*' => [
            'uuid',
            'distinct',
            'exists:menus,id',
        ],

    ]);

    $menuIds = collect(
        $validated['menu_ids']
    )
        ->map(fn ($id) => (string) $id)
        ->unique()
        ->values();


    /*
    |--------------------------------------------------------------------------
    | TRANSACTION
    |--------------------------------------------------------------------------
    */

    \DB::transaction(function () use (
        $user,
        $menuIds
    ) {

        /*
        |--------------------------------------------------------------------------
        | NONAKTIFKAN SEMUA MENU USER
        |--------------------------------------------------------------------------
        |
        | Jangan delete row.
        | Kita menggunakan is_active sebagai status assignment.
        |
        */

        \DB::table('user_menu')
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->update([
                'is_active' => false,
                'updated_at' => now(),
                'updated_by' => auth()->id(),
            ]);


        /*
        |--------------------------------------------------------------------------
        | AKTIFKAN / INSERT MENU YANG DIPILIH
        |--------------------------------------------------------------------------
        */

        foreach ($menuIds as $menuId) {

            $existing = \DB::table('user_menu')
                ->where('user_id', $user->id)
                ->where('menu_id', $menuId)
                ->first();

            /*
            |--------------------------------------------------------------------------
            | SUDAH ADA
            |--------------------------------------------------------------------------
            */

            if ($existing) {

                \DB::table('user_menu')
                    ->where('id', $existing->id)
                    ->update([
                        'is_active' => true,
                        'deleted_at' => null,
                        'deleted_by' => null,
                        'updated_at' => now(),
                        'updated_by' => auth()->id(),
                    ]);

                continue;
            }


            /*
            |--------------------------------------------------------------------------
            | BELUM ADA
            |--------------------------------------------------------------------------
            */

            \DB::table('user_menu')
                ->insert([
                    'id' => (string) \Illuminate\Support\Str::uuid(),

                    'user_id' => $user->id,

                    'menu_id' => $menuId,

                    'is_active' => true,

                    'created_by' => auth()->id(),

                    'updated_by' => auth()->id(),

                    'deleted_by' => null,

                    'created_at' => now(),

                    'updated_at' => now(),

                    'deleted_at' => null,
                ]);
        }

    });


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return response()->json([

        'success' => true,

        'message' =>
            'Menu Access user berhasil diperbarui.',

        'data' => [

            'user' => [
                'id' => $user->id,

                'name' => $user->name,

                'email' => $user->email,
            ],

            /*
            |--------------------------------------------------------------------------
            | MENU ACCESS TERBARU
            |--------------------------------------------------------------------------
            */

            'menus' =>
                $this->getMenuAccess($user),

        ],

    ]);
}







}