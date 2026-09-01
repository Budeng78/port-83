<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Panggil seeder dari Modul Auth secara otomatis di sini
        $this->call([
            \Modules\Platform\Auth\Database\Seeders\DatabaseSeeder::class,
            \Modules\Platform\System\Database\Seeders\DatabaseSeeder::class,
            \Modules\Platform\RBAC\Database\Seeders\DatabaseSeeder::class,
        ]);
    }
}
