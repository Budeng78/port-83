<?php

namespace Modules\Platform\RBAC\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Platform\RBAC\Models\OrganizationLevel;

class OrganizationLevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            [
                'code' => 'MANAGER',
                'name' => 'Manager',
                'description' => 'Pimpinan tingkat Manager',
                'sort_order' => 1,
            ],
            [
                'code' => 'SUPERINTENDENT',
                'name' => 'Superintendent',
                'description' => 'Pimpinan operasional di bawah Manager',
                'sort_order' => 2,
            ],
            [
                'code' => 'SUPERVISOR',
                'name' => 'Supervisor',
                'description' => 'Pengawas operasional',
                'sort_order' => 3,
            ],
            [
                'code' => 'LEADER',
                'name' => 'Leader',
                'description' => 'Pemimpin operasional tingkat lapangan',
                'sort_order' => 4,
            ],
            [
                'code' => 'OPERATOR',
                'name' => 'Operator',
                'description' => 'Pelaksana operasional',
                'sort_order' => 5,
            ],
        ];

        foreach ($levels as $level) {
            OrganizationLevel::updateOrCreate(
                ['code' => $level['code']],
                [
                    'name' => $level['name'],
                    'description' => $level['description'],
                    'sort_order' => $level['sort_order'],
                    'is_active' => true,
                ]
            );
        }

        /*
         * Bentuk hierarchy:
         *
         * Manager
         *    └── Superintendent
         *          └── Supervisor
         *                └── Leader
         *                      └── Operator
         */

        $manager = OrganizationLevel::where('code', 'MANAGER')->first();
        $superintendent = OrganizationLevel::where('code', 'SUPERINTENDENT')->first();
        $supervisor = OrganizationLevel::where('code', 'SUPERVISOR')->first();
        $leader = OrganizationLevel::where('code', 'LEADER')->first();
        $operator = OrganizationLevel::where('code', 'OPERATOR')->first();

        $superintendent->update([
            'parent_id' => $manager->id,
        ]);

        $supervisor->update([
            'parent_id' => $superintendent->id,
        ]);

        $leader->update([
            'parent_id' => $supervisor->id,
        ]);

        $operator->update([
            'parent_id' => $leader->id,
        ]);
    }
}