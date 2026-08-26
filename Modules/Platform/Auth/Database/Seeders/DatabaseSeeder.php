<?php

namespace Modules\Platform\Auth\Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            \Modules\Platform\Auth\Database\Seeders\UserSeeder::class,
            
        ]);
    }
}