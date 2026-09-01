<?php

namespace Modules\Platform\RBAC\Database\Seeders;


use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class PrimaryRoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'Primary.Kepala-Primary',
            'Primary.QA',
            'Primary.PPIC',
            'Primary.Kepala-Pelaksana',
            'Primary.Kepala-QC',
            'Primary.QC',
            'Primary.Mandor',
            'Primary.Operator',
            'Primary.Tenaga',
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate([
                'name' => $role,
                'guard_name' => 'web',
            ]);
        }

        $this->command?->info(
            'Role PRIMARY berhasil dibuat.'
        );
    }
}