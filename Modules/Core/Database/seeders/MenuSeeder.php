<?php

namespace Modules\Core\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Core\Models\Menu;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // Masukkan data menu awal di sini
        Menu::create([
            'title' => 'Dashboard',
            'route' => '/dashboard',
            'icon' => 'LayoutDashboard',
            'order' => 1,
            'is_active' => true,
        ]);
    }
}