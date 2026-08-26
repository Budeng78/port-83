<?php

namespace Modules\Platform\RBAC\Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PrimaryPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // =====================================================
            // PLAN
            // =====================================================
            'primary.plan.view',
            'primary.plan.create',
            'primary.plan.update',
            'primary.plan.delete',

            // =====================================================
            // DO
            // =====================================================
            'primary.do.view',
            'primary.do.create',
            'primary.do.update',
            'primary.do.delete',

            // =====================================================
            // CHECK
            // =====================================================
            'primary.check.view',
            'primary.check.create',
            'primary.check.update',
            'primary.check.delete',

            // =====================================================
            // ACT
            // =====================================================
            'primary.act.view',
            'primary.act.create',
            'primary.act.update',
            'primary.act.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $this->command?->info(
            'Permission PRIMARY berhasil dibuat.'
        );
    }
}