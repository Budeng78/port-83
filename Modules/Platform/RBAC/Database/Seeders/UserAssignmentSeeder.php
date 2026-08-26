<?php

namespace Modules\Platform\RBAC\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Platform\Auth\Models\User;
use Modules\Platform\RBAC\Models\OrganizationUnit;
use Modules\Platform\RBAC\Models\OrganizationLevel;
use Modules\Platform\RBAC\Models\UserAssignment;

class UserAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@system.com')->firstOrFail();

        $produksi = OrganizationUnit::where('code', 'PRODUKSI')->firstOrFail();
        $prosesCK = OrganizationUnit::where('code', 'PROSES_CK')->firstOrFail();

        $manager = OrganizationLevel::where('code', 'MANAGER')->firstOrFail();
        $supervisor = OrganizationLevel::where('code', 'SUPERVISOR')->firstOrFail();

        UserAssignment::updateOrCreate(
            [
                'user_id' => $user->id,
                'organization_unit_id' => $produksi->id,
                'organization_level_id' => $manager->id,
            ],
            [
                'is_primary' => true,
                'is_active' => true,
            ]
        );

        UserAssignment::updateOrCreate(
            [
                'user_id' => $user->id,
                'organization_unit_id' => $prosesCK->id,
                'organization_level_id' => $supervisor->id,
            ],
            [
                'is_primary' => false,
                'is_active' => true,
            ]
        );
    }
}