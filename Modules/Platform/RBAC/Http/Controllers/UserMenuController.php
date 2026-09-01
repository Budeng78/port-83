<?php

namespace Modules\Platform\RBAC\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Platform\Auth\Models\User;
use Modules\Platform\System\Models\Menu;
use Modules\Platform\System\Models\UserMenu;
use Illuminate\Support\Facades\DB;

class UserMenuController extends Controller
{
    /**
     * GET /api/users/{user}/menus
     *
     * Menampilkan seluruh menu dan menu yang diberikan
     * kepada user.
     */
    public function index(User $user): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | ALL ACTIVE MENUS
        |--------------------------------------------------------------------------
        */

        $menus = Menu::query()
            ->where('is_active', true)
            ->with([
                'children' => function ($query) {
                    $query
                        ->where('is_active', true)
                        ->orderBy('order');
                },
            ])
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();


        /*
        |--------------------------------------------------------------------------
        | USER MENU IDS
        |--------------------------------------------------------------------------
        */

        $selectedMenuIds = UserMenu::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->pluck('menu_id')
            ->map(fn ($id) => (string) $id)
            ->values();


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'data' => [
                'menus' => $menus,
                'selected_menu_ids' => $selectedMenuIds,
            ],
        ]);
    }


    /**
     * PUT /api/users/{user}/menus
     *
     * Menyimpan akses menu user.
     */
    public function update(
        Request $request,
        User $user
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $menuIds = $request->all();

        if (!is_array($menuIds)) {

            return response()->json([
                'success' => false,
                'message' => 'Format menu tidak valid.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | NORMALIZE MENU IDS
        |--------------------------------------------------------------------------
        */

        $menuIds = collect($menuIds)
            ->filter()
            ->map(fn ($id) => (string) $id)
            ->unique()
            ->values();


        /*
        |--------------------------------------------------------------------------
        | VALIDATE MENU EXISTENCE
        |--------------------------------------------------------------------------
        */

        $validMenuIds = Menu::query()
            ->whereIn('id', $menuIds)
            ->where('is_active', true)
            ->pluck('id')
            ->map(fn ($id) => (string) $id)
            ->values();


        /*
        |--------------------------------------------------------------------------
        | SAVE
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use (
            $user,
            $validMenuIds
        ) {

            /*
            |--------------------------------------------------------------------------
            | NONAKTIFKAN SEMUA AKSES USER
            |--------------------------------------------------------------------------
            */

            UserMenu::query()
                ->where('user_id', $user->id)
                ->update([
                    'is_active' => false,
                ]);


            /*
            |--------------------------------------------------------------------------
            | AKTIFKAN / BUAT AKSES YANG DIPILIH
            |--------------------------------------------------------------------------
            */

            foreach ($validMenuIds as $menuId) {

                $userMenu = UserMenu::withTrashed()
                    ->where('user_id', $user->id)
                    ->where('menu_id', $menuId)
                    ->first();


                if ($userMenu) {

                    /*
                    |--------------------------------------------------------------
                    | Record sudah ada
                    |--------------------------------------------------------------
                    */

                    $userMenu->restore();

                    $userMenu->update([
                        'is_active' => true,
                    ]);

                } else {

                    /*
                    |--------------------------------------------------------------
                    | Record belum pernah ada
                    |--------------------------------------------------------------
                    */

                    UserMenu::create([
                        'user_id' => $user->id,
                        'menu_id' => $menuId,
                        'is_active' => true,
                    ]);
                }
            }
        });


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' => 'Akses menu berhasil disimpan.',
            'data' => [
                'user_id' => $user->id,
                'selected_menu_ids' => $validMenuIds,
            ],
        ]);
    }
}