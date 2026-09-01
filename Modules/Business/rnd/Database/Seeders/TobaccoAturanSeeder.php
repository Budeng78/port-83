<?php
namespace Modules\Business\rnd\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Business\rnd\Models\TobaccoAturan;
use Illuminate\Support\Str;

class TobaccoAturanSeeder extends Seeder
{
    public function run(): void
    {
        TobaccoAturan::create([
            'id' => (string) Str::uuid(), // Atau menggunakan generator uuid7 jika sudah diset di model/trait
            'code' => 'TB-2026-001',
            'type' => 'precut',
            'form_number' => 'F.EXC -39 C/2026',
            'document_date' => '2026-08-20',
            'item_no' => 1,
            'gdg' => 'J4',
            'jenis_tembakau' => 'CHN',
            'tahun' => 2024,
            's_k' => '08 PS 26',
            'grade' => 'M1F',
            'rencana' => 1000.00,
        ]);

        TobaccoAturan::create([
            'id' => (string) Str::uuid(),
            'code' => 'TB-2026-002',
            'type' => 'precut',
            'form_number' => 'F.EXC -39 C/2026',
            'document_date' => '2026-08-20',
            'item_no' => 2,
            'gdg' => 'J4',
            'jenis_tembakau' => 'CHN',
            'tahun' => 2023,
            's_k' => '03 PS 26',
            'grade' => 'BCF',
            'rencana' => 3000.00,
        ]);
    }
}