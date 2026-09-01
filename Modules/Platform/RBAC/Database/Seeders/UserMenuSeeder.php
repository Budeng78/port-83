<?php

namespace Modules\Platform\RBAC\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Platform\Auth\Models\User;
use Modules\Platform\System\Models\Menu;

class UserMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | User
        |--------------------------------------------------------------------------
        |
        | User yang digunakan:
        | Admin prototype
        | admin@system.com
        |
        */
        $user = User::where('email', 'admin@system.com')->first();

        if (! $user) {
            $this->command->error(
                'User admin@system.com tidak ditemukan.'
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Menu
        |--------------------------------------------------------------------------
        |
        | Menu yang diberikan kepada Admin prototype.
        |
        | ID diambil dari data database yang sudah ada.
        |
        */
        $menuIds = [
            '01a0352f-cc54-736d-94d2-dc9974b701f9',
            '5cf85718-9afd-11f1-9597-7cd30a1f09ce',
            '6c5fa8a5-9afd-11f1-9597-7cd30a1f09ce',
            '7ca480a1-9afd-11f1-9597-7cd30a1f09ce',
            '7ca4887e-9afd-11f1-9597-7cd30a1f09ce',
            '7ca48b77-9afd-11f1-9597-7cd30a1f09ce',
            'bc7b9ac7-9993-11f1-9597-7cd30a1f09ce',
            'bc7ba50f-9993-11f1-9597-7cd30a1f09ce',
        ];

        /*
        |--------------------------------------------------------------------------
        | Validasi Menu
        |--------------------------------------------------------------------------
        */

        $menus = Menu::whereIn('id', $menuIds)
            ->get()
            ->keyBy('id');

        /*
        |--------------------------------------------------------------------------
        | Insert User Menu
        |--------------------------------------------------------------------------
        */

        foreach ($menuIds as $menuId) {

            if (! isset($menus[$menuId])) {
                $this->command->warn(
                    "Menu {$menuId} tidak ditemukan, dilewati."
                );

                continue;
            }

            DB::table('user_menu')->updateOrInsert(
                [
                    'user_id' => $user->id,
                    'menu_id' => $menuId,
                ],
                [
                    'id' => (string) Str::uuid(),
                    'is_active' => true,
                    'created_by' => $user->id,
                    'updated_by' => null,
                    'deleted_by' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                    'deleted_at' => null,
                ]
            );
        }

        $this->command->info(
            "User menu berhasil disinkronkan untuk {$user->name} ({$user->email})."
        );
    }
}

