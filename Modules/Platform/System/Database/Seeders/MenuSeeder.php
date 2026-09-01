<?php

namespace Modules\Platform\System\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Platform\System\Models\Menu;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
            /*
             * ============================================================
             * DASHBOARD
             * ============================================================
             */
            [
                'id' => '5cf85718-9afd-11f1-9597-7cd30a1f09ce',
                'label' => 'Dashboard',
                'path' => '/app/platform/dashboard',
                'icon' => 'LayoutDashboard',

                // Semua user yang memiliki akses aplikasi
                'assignment_key' => null,
                'permission_key' => null,

                'parent_id' => null,
                'order' => 1,
                'is_active' => true,
            ],

            /*
             * ============================================================
             * ADMINISTRATION
             * ============================================================
             */
            [
                'id' => '6c5fa8a5-9afd-11f1-9597-7cd30a1f09ce',
                'label' => 'Administration',
                'path' => null,
                'icon' => 'ShieldCheck',

                'assignment_key' => null,
                'permission_key' => null,

                'parent_id' => null,
                'order' => 10,
                'is_active' => true,
            ],

            /*
             * USERS
             *
             * permission_key bukan lagi permission Spatie.
             * Ini menjadi access marker untuk fungsi halaman.
             */
            [
                'id' => '7ca480a1-9afd-11f1-9597-7cd30a1f09ce',
                'label' => 'Users',
                'path' => '/app/platform/users',
                'icon' => 'Users',

                'assignment_key' => null,
                'permission_key' => 'users',

                'parent_id' => '6c5fa8a5-9afd-11f1-9597-7cd30a1f09ce',
                'order' => 1,
                'is_active' => true,
            ],

            /*
             * ROLES
             */
            [
                'id' => '7ca4887e-9afd-11f1-9597-7cd30a1f09ce',
                'label' => 'Roles',
                'path' => '/app/platform/roles',
                'icon' => 'ShieldCheck',

                'assignment_key' => null,
                'permission_key' => 'roles',

                'parent_id' => '6c5fa8a5-9afd-11f1-9597-7cd30a1f09ce',
                'order' => 2,
                'is_active' => true,
            ],

            /*
             * PERMISSIONS
             */
            [
                'id' => '7ca48b77-9afd-11f1-9597-7cd30a1f09ce',
                'label' => 'Permissions',
                'path' => '/app/platform/permissions',
                'icon' => 'KeyRound',

                'assignment_key' => null,
                'permission_key' => 'permissions',

                'parent_id' => '6c5fa8a5-9afd-11f1-9597-7cd30a1f09ce',
                'order' => 3,
                'is_active' => true,
            ],

            /*
             * USER MENU
             */
            [
                'id' => '01a0352f-cc54-736d-94d2-dc9974b701f9',
                'label' => 'User Menu',
                'path' => '/app/platform/usermenu',
                'icon' => 'Users',

                'assignment_key' => null,
                'permission_key' => 'user-menu',

                'parent_id' => '6c5fa8a5-9afd-11f1-9597-7cd30a1f09ce',
                'order' => 5,
                'is_active' => true,
            ],

            /*
             * ============================================================
             * MENU SETTING
             * ============================================================
             */
            [
                'id' => 'bc7b9ac7-9993-11f1-9597-7cd30a1f09ce',
                'label' => 'Menu Setting',
                'path' => '/app/platform/menus',
                'icon' => 'Settings',

                'assignment_key' => null,
                'permission_key' => 'menu-setting',

                'parent_id' => null,
                'order' => 90,
                'is_active' => true,
            ],

            /*
             * ============================================================
             * USER SETTING
             * ============================================================
             */
            [
                'id' => 'bc7ba50f-9993-11f1-9597-7cd30a1f09ce',
                'label' => 'User Setting',
                'path' => '/app/platform/user-setting',
                'icon' => 'UserCog',

                'assignment_key' => null,
                'permission_key' => 'user-setting',

                'parent_id' => null,
                'order' => 91,
                'is_active' => true,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(
                ['id' => $menu['id']],
                $menu
            );
        }
    }
}