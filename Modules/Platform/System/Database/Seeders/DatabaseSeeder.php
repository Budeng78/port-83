<?php

namespace Modules\Platform\System\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Platform\System\Database\Seeders\MenuSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            MenuSeeder::class,
        ]);
    }
}