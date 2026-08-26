<?php

namespace Modules\Platform\Auth\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Platform\Auth\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Akun Super Admin Default
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@system.com'],
            [
                'name' => 'Admin prototype',
                'no_whatsapp' => '081326747779',
                'password' => Hash::make('Admin123!'), // Ganti password jika diperlukan
            ]
        );

        // 2. Ambil role Super Admin dengan guard 'web'
        $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        // 3. Assign role ke user jika belum terikat
        if (!$adminUser->hasRole('Super Admin')) {
            $adminUser->assignRole($role);
        }
    }
}