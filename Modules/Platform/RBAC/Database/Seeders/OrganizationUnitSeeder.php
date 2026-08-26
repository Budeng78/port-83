<?php

namespace Modules\Platform\RBAC\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Platform\RBAC\Models\OrganizationUnit;

class OrganizationUnitSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Produksi
        |--------------------------------------------------------------------------
        */

        $produksi = OrganizationUnit::updateOrCreate(
            ['code' => 'PRODUKSI'],
            [
                'name' => 'Produksi',
                'type' => 'DEPARTMENT',
                'description' => 'Departemen Produksi',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Primary
        |--------------------------------------------------------------------------
        */

        $primary = OrganizationUnit::updateOrCreate(
            ['code' => 'PRIMARY'],
            [
                'parent_id' => $produksi->id,
                'name' => 'Primary',
                'type' => 'SECTION',
                'description' => 'Primary Production',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        $primaryUnits = [
            ['RAJANG', 'Rajang'],
            ['GUDANG_BLEND', 'Gudang Blend'],
            ['OTOMATIS', 'Otomatis'],
            ['MANUAL', 'Manual'],
            ['GUDANG_TSG', 'Gudang TSG'],
            ['KITCHEN', 'Kitchen'],
            ['PROSES_1', 'Proses 1'],
            ['PROSES_2', 'Proses 2'],
            ['PROSES_CK', 'Proses CK'],
        ];

        foreach ($primaryUnits as $index => [$code, $name]) {
            OrganizationUnit::updateOrCreate(
                ['code' => $code],
                [
                    'parent_id' => $primary->id,
                    'name' => $name,
                    'type' => 'WORK_CENTER',
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Secondary
        |--------------------------------------------------------------------------
        */

        $secondary = OrganizationUnit::updateOrCreate(
            ['code' => 'SECONDARY'],
            [
                'parent_id' => $produksi->id,
                'name' => 'Secondary',
                'type' => 'SECTION',
                'description' => 'Secondary Production',
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        $secondaryUnits = [
            ['SKT', 'SKT'],
            ['SKM', 'SKM'],
            ['GUDANG_MATERIAL', 'Gudang Material'],
            ['GUDANG_PRODUK', 'Gudang Produk'],
        ];

        foreach ($secondaryUnits as $index => [$code, $name]) {
            OrganizationUnit::updateOrCreate(
                ['code' => $code],
                [
                    'parent_id' => $secondary->id,
                    'name' => $name,
                    'type' => 'WORK_CENTER',
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }
    }
}