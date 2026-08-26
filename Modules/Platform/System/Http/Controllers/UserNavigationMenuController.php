<?php

namespace Modules\Platform\System\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Modules\Platform\Auth\Models\User;
use Modules\Platform\System\Models\Menu;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;

class UserNavigationMenuController extends Controller
{
    /**
     * GET /api/system/user-menus
     *
     * Navigation menu user berdasarkan:
     *
     * 1. Active User Assignment
     * 2. Organization Unit Name
     * 3. Menu organization_unit_name
     * 4. Permission
     *
     * Rule:
     *
     * - Menu harus aktif.
     * - organization_unit_name NULL = menu global/container.
     * - organization_unit_name terisi =
     *   harus cocok dengan organization_units.name
     *   dari assignment aktif user.
     * - Jika permission_key terisi,
     *   user wajib memiliki permission.
     * - Parent otomatis ikut jika memiliki child yang lolos.
     */
    public function index(): JsonResponse
    {
        /** @var User|null $user */
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | AUTH CHECK
        |--------------------------------------------------------------------------
        */

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | SUPER ADMIN
        |--------------------------------------------------------------------------
        |
        | Super admin mendapatkan seluruh menu aktif.
        |
        */

        if ($user->email === 'admin@system.com') {

            $allMenus = Menu::query()
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->orderBy('order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $this->buildTree($allMenus),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 1. USER ASSIGNMENT
        |--------------------------------------------------------------------------
        |
        | Ambil seluruh assignment aktif milik user.
        |
        | Assignment memiliki relasi:
        |
        | assignment
        |     └── organizationUnit
        |             └── name
        |
        */

        $assignments = $user->assignments()
            ->with('organizationUnit')
            ->where('is_active', true)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | 2. ORGANIZATION UNIT NAME USER
        |--------------------------------------------------------------------------
        |
        | Ambil organization_unit.name dari seluruh assignment aktif.
        |
        | Contoh:
        |
        | User memiliki:
        |
        | - SYSTEM
        | - PRODUKSI
        |
        | Maka:
        |
        | $organizationUnitNames
        |
        | = [
        |     'system',
        |     'produksi'
        |   ]
        |
        */

        $organizationUnitNames = $assignments
            ->map(function ($assignment) {

                return $assignment->organizationUnit?->name;
            })
            ->filter()
            ->map(function ($name) {

                return mb_strtolower(
                    trim($name)
                );
            })
            ->unique()
            ->values();

        /*
        |--------------------------------------------------------------------------
        | 3. SEMUA MENU AKTIF
        |--------------------------------------------------------------------------
        */

        $allMenus = Menu::query()
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->orderBy('order')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | EMPTY MENU
        |--------------------------------------------------------------------------
        */

        if ($allMenus->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 4. FILTER BERDASARKAN ORGANIZATION UNIT
        |--------------------------------------------------------------------------
        |
        | Rule:
        |
        | organization_unit_name = NULL
        |     → menu global/container
        |
        | organization_unit_name = "system"
        |     → hanya user yang memiliki
        |       assignment ke organization unit "system"
        |
        */

        $organizationUnitMenus = $allMenus->filter(
            function ($menu) use ($organizationUnitNames) {

                /*
                |--------------------------------------------------------------------------
                | MENU GLOBAL
                |--------------------------------------------------------------------------
                |
                | Jika organization_unit_name kosong,
                | menu dianggap sebagai menu global/container.
                |
                */

                if (
                    $menu->organization_unit_name === null ||
                    trim($menu->organization_unit_name) === ''
                ) {
                    return true;
                }

                /*
                |--------------------------------------------------------------------------
                | MATCH ORGANIZATION UNIT
                |--------------------------------------------------------------------------
                */

                $menuOrganizationUnitName =
                    mb_strtolower(
                        trim(
                            $menu->organization_unit_name
                        )
                    );

                return $organizationUnitNames->contains(
                    $menuOrganizationUnitName
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | 5. PERMISSION FILTER
        |--------------------------------------------------------------------------
        |
        | Organization Unit menentukan:
        |
        | "User berada di area mana?"
        |
        | Permission menentukan:
        |
        | "User boleh melakukan apa?"
        |
        */

        $allowedMenus = $organizationUnitMenus->filter(
            function ($menu) use ($user) {

                /*
                |--------------------------------------------------------------------------
                | MENU TANPA PERMISSION
                |--------------------------------------------------------------------------
                |
                | Jika permission_key kosong,
                | organization unit sudah cukup.
                |
                */

                if (
                    $menu->permission_key === null ||
                    trim($menu->permission_key) === ''
                ) {
                    return true;
                }

                /*
                |--------------------------------------------------------------------------
                | USER HARUS MEMILIKI METHOD PERMISSION
                |--------------------------------------------------------------------------
                */

                if (
                    !method_exists(
                        $user,
                        'hasPermissionTo'
                    )
                ) {
                    return false;
                }

                /*
                |--------------------------------------------------------------------------
                | CHECK PERMISSION
                |--------------------------------------------------------------------------
                */

                try {

                    return $user->hasPermissionTo(
                        $menu->permission_key
                    );

                } catch (
                    PermissionDoesNotExist
                ) {

                    /*
                    |--------------------------------------------------------------------------
                    | Permission belum terdaftar.
                    |
                    | Demi keamanan:
                    | menu JANGAN ditampilkan.
                    |--------------------------------------------------------------------------
                    */

                    return false;
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | 6. TIDAK ADA MENU YANG LOLOS
        |--------------------------------------------------------------------------
        */

        if ($allowedMenus->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 7. INDEX MENU
        |--------------------------------------------------------------------------
        */

        $menuById = $allMenus->keyBy(
            fn ($menu) => (string) $menu->id
        );

        /*
        |--------------------------------------------------------------------------
        | 8. AMBIL ID MENU YANG LOLOS
        |--------------------------------------------------------------------------
        */

        $allowedIds = $allowedMenus
            ->map(
                fn ($menu) => (string) $menu->id
            )
            ->unique()
            ->values();

        /*
        |--------------------------------------------------------------------------
        | 9. TAMBAHKAN SELURUH PARENT
        |--------------------------------------------------------------------------
        |
        | Contoh:
        |
        | Administration
        |     └── Users
        |
        | Jika Users lolos filter,
        | Administration tetap harus ikut.
        |
        */

        $allowedIds = $this->includeParents(
            $allowedIds,
            $menuById
        );

        /*
        |--------------------------------------------------------------------------
        | 10. FILTER FINAL
        |--------------------------------------------------------------------------
        */

        $finalMenus = $allMenus
            ->filter(
                fn ($menu) =>
                    $allowedIds->contains(
                        (string) $menu->id
                    )
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | 11. BUILD TREE
        |--------------------------------------------------------------------------
        */

        $menuTree = $this->buildTree(
            $finalMenus
        );

        /*
        |--------------------------------------------------------------------------
        | 12. RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'data' => $menuTree,
        ]);
    }

    /**
     * Tambahkan seluruh parent dari menu
     * yang sudah lolos filter.
     */
    private function includeParents(
        $allowedIds,
        $menuById
    ) {
        $result = $allowedIds
            ->unique()
            ->values();

        foreach ($allowedIds as $menuId) {

            $menu = $menuById->get(
                (string) $menuId
            );

            if (!$menu) {
                continue;
            }

            $parentId = $menu->parent_id
                ? (string) $menu->parent_id
                : null;

            while ($parentId) {

                $parent = $menuById->get(
                    $parentId
                );

                if (!$parent) {
                    break;
                }

                $result->push(
                    (string) $parent->id
                );

                $parentId = $parent->parent_id
                    ? (string) $parent->parent_id
                    : null;
            }
        }

        return $result
            ->unique()
            ->values();
    }

    /**
     * Build menu tree.
     */
    private function buildTree(
        $menus,
        $parentId = null
    ) {
        return $menus
            ->filter(
                function ($menu) use ($parentId) {

                    if ($parentId === null) {
                        return $menu->parent_id === null;
                    }

                    return (string) $menu->parent_id ===
                        (string) $parentId;
                }
            )
            ->sortBy('order')
            ->map(
                function ($menu) use ($menus) {

                    $children = $this->buildTree(
                        $menus,
                        $menu->id
                    );

                    $data = $menu->toArray();

                    $data['children'] = $children
                        ->values()
                        ->toArray();

                    return $data;
                }
            )
            ->values();
    }
}