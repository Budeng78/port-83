<?php

namespace Modules\Auth\Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Daftar Permissions Berdasarkan Modul Sistem
        $permissions = [
            // Dashboard & Core
            'view-dashboard',
            'manage-settings',
            
            // RBAC & User Management
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',

            // Menu Management
            'view-menus',
            'manage-menus',

            // Personalia & Karyawan
            'view-employees',
            'create-employees',
            'edit-employees',
            'delete-employees',

            // Payroll & Sistem Penggajian
            'view-payroll',
            'manage-payroll',
        ];

        // Masukkan permission ke database menggunakan guard 'web'
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // 2. Definisikan Roles dan Hubungannya dengan Permissions

        // A. Super Admin (Akses Penuh Keseluruhan Sistem)
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdminRole->givePermissionTo(Permission::all());

        // B. Personalia / HR (Fokus pada Karyawan dan Penggajian)
        $personaliaRole = Role::firstOrCreate(['name' => 'Personalia', 'guard_name' => 'web']);
        $personaliaRole->givePermissionTo([
            'view-dashboard',
            'view-employees',
            'create-employees',
            'edit-employees',
            'view-payroll',
            'manage-payroll',
        ]);

        // C. Staff / Pengguna Umum (Hanya Akses Dashboard Dasar)
        $staffRole = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'web']);
        $staffRole->givePermissionTo([
            'view-dashboard',
        ]);
    }
}