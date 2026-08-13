<?php

namespace Modules\System\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\System\Models\Menu;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
            [
                'label' => 'Dashboard',
                'path' => '/dashboard',
                'icon' => 'LayoutDashboard',
                'permission_name' => 'view-dashboard',
                'parent_id' => null,
                'order' => 1,
                'is_active' => true,
            ],
            [
                'label' => 'Manajemen Pengguna',
                'path' => '/users',
                'icon' => 'Users',
                'permission_name' => 'view-users',
                'parent_id' => null,
                'order' => 2,
                'is_active' => true,
            ],
            [
                'label' => 'Peran & Hak Akses',
                'path' => '/roles',
                'icon' => 'ShieldCheck',
                'permission_name' => 'view-roles',
                'parent_id' => null,
                'order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::firstOrCreate(
                ['path' => $menu['path']],
                $menu
            );
        }
    }
}