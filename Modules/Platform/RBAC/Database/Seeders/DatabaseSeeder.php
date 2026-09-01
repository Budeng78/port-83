<?php

namespace Modules\Platform\RBAC\Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            OrganizationLevelSeeder::class,
            OrganizationUnitSeeder::class,
            UserAssignmentSeeder::class,
            PrimaryRoleSeeder::class,
            PrimaryPermissionSeeder::class,
            UserMenuSeeder::class,
        ]);
    }
}