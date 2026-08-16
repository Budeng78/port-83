<?php

namespace Modules\RBAC\Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Reset Permission Cache
        |--------------------------------------------------------------------------
        */

        app(PermissionRegistrar::class)->forgetCachedPermissions();


        /*
        |--------------------------------------------------------------------------
        | Permission Lama
        |--------------------------------------------------------------------------
        |
        | Permission versi sebelumnya yang akan dimigrasikan.
        |
        */

        $oldPermissions = [
            'view-dashboard',
            'manage-settings',

            'view-users',
            'create-users',
            'edit-users',
            'delete-users',

            'view-menus',
            'manage-menus',

            'view-employees',
            'create-employees',
            'edit-employees',
            'delete-employees',

            'view-payroll',
            'manage-payroll',
        ];


        /*
        |--------------------------------------------------------------------------
        | Hapus Permission Lama
        |--------------------------------------------------------------------------
        |
        | Role tidak dihapus.
        | User tidak dihapus.
        |
        */

        foreach ($oldPermissions as $permission) {
            Permission::where('name', $permission)
                ->where('guard_name', 'web')
                ->delete();
        }


        /*
        |--------------------------------------------------------------------------
        | Permissions Baru
        |--------------------------------------------------------------------------
        |
        | Format:
        |
        | module.action
        |
        */

        $permissions = [

            // Dashboard
            'dashboard.view',

            // System
            'system.settings.manage',
            'system.menu.view',
            'system.menu.manage',

            // Users / RBAC
            'users.view',
            'users.create',
            'users.update',
            'users.delete',

            // Personalia
            'employees.view',
            'employees.create',
            'employees.update',
            'employees.delete',

            // Payroll
            'payroll.view',
            'payroll.manage',
        ];


        /*
        |--------------------------------------------------------------------------
        | Create Permissions
        |--------------------------------------------------------------------------
        */

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | Super Admin
        |--------------------------------------------------------------------------
        */

        $superAdminRole = Role::firstOrCreate([
            'name' => 'Super Admin',
            'guard_name' => 'web',
        ]);

        $superAdminRole->syncPermissions(
            Permission::where('guard_name', 'web')->get()
        );


        /*
        |--------------------------------------------------------------------------
        | Personalia
        |--------------------------------------------------------------------------
        */

        $personaliaRole = Role::firstOrCreate([
            'name' => 'Personalia',
            'guard_name' => 'web',
        ]);

        $personaliaRole->syncPermissions([
            'dashboard.view',

            'employees.view',
            'employees.create',
            'employees.update',

            'payroll.view',
            'payroll.manage',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Staff
        |--------------------------------------------------------------------------
        */

        $staffRole = Role::firstOrCreate([
            'name' => 'Staff',
            'guard_name' => 'web',
        ]);

        $staffRole->syncPermissions([
            'dashboard.view',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Clear Permission Cache
        |--------------------------------------------------------------------------
        */

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}