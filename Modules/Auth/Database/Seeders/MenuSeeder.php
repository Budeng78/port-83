<?php

namespace Modules\Auth\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Auth\Models\Menu;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Menu Dashboard (Single Menu)
        $dashboard = Menu::firstOrCreate(
            ['path' => '/dashboard'],
            [
                'label' => 'Dashboard',
                'icon' => 'LayoutDashboard',
                'permission_name' => 'view-dashboard',
                'order' => 1,
                'is_active' => true,
            ]
        );

        // 2. Menu Manajemen User (Parent Menu)
        $userManagement = Menu::firstOrCreate(
            ['label' => 'User Management', 'path' => null],
            [
                'icon' => 'Users',
                'permission_name' => 'view-users',
                'order' => 2,
                'is_active' => true,
            ]
        );

        // Submenu: Daftar Pengguna
        Menu::firstOrCreate(
            ['path' => '/users'],
            [
                'label' => 'Daftar User',
                'icon' => 'UserCheck',
                'permission_name' => 'view-users',
                'parent_id' => $userManagement->id,
                'order' => 1,
                'is_active' => true,
            ]
        );

        // Submenu: Menu Management (Pengaturan Menu)
        Menu::firstOrCreate(
            ['path' => '/menus'],
            [
                'label' => 'Pengaturan Menu',
                'icon' => 'Menu',
                'permission_name' => 'view-menus',
                'parent_id' => $userManagement->id,
                'order' => 2,
                'is_active' => true,
            ]
        );

        // 3. Menu Payroll / Penggajian
        Menu::firstOrCreate(
            ['path' => '/payroll'],
            [
                'label' => 'Payroll',
                'icon' => 'Wallet',
                'permission_name' => 'view-payroll',
                'order' => 3,
                'is_active' => true,
            ]
        );
    }
}