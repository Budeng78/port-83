<?php

namespace Modules\Business\Rnd\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Modules\Business\Rnd\Models\RndTobaccoAturan;
use Modules\Business\Rnd\Models\RndTobaccoAturanDetail;

class RndTobaccoAturanSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            /*
             * =====================================================
             * 50 ATURAN
             * =====================================================
             */

            for ($aturanIndex = 1; $aturanIndex <= 50; $aturanIndex++) {

                /*
                 * -------------------------------------------------
                 * HEADER
                 * -------------------------------------------------
                 */

                $aturan = RndTobaccoAturan::create([
                    'kode_aturan' => sprintf(
                        'AT-TBK-%03d',
                        $aturanIndex
                    ),

                    'tanggal_aturan' => now()
                        ->subDays(50 - $aturanIndex)
                        ->toDateString(),
                ]);

                /*
                 * -------------------------------------------------
                 * JUMLAH DETAIL
                 * Random 10 sampai 15
                 * -------------------------------------------------
                 */

                $jumlahDetail = rand(10, 15);

                /*
                 * -------------------------------------------------
                 * DETAIL
                 * -------------------------------------------------
                 */

                for ($detailNo = 1; $detailNo <= $jumlahDetail; $detailNo++) {

                    RndTobaccoAturanDetail::create([
                        'aturan_id' => $aturan->id,

                        'type' => fake()->randomElement([
                            'Krosok',
                            'Precut',
                        ]),

                        'no' => $detailNo,

                        'gdg' => fake()->randomElement([
                            'GDG-A',
                            'GDG-B',
                            'GDG-C',
                        ]),

                        'jenis_tembakau' => fake()->randomElement([
                            'Tembakau Virginia',
                            'Tembakau Burley',
                            'Tembakau Madura',
                            'Tembakau Besuki',
                            'Tembakau Kasturi',
                        ]),

                        'tahun' => fake()->numberBetween(
                            2023,
                            2026
                        ),

                        's_k' => fake()->randomElement([
                            'S',
                            'K',
                            'S/K',
                        ]),

                        'grade' => fake()->randomElement([
                            'A',
                            'B',
                            'C',
                            'D',
                        ]),

                        'rencana' => fake()->randomFloat(
                            2,
                            100,
                            5000
                        ),
                    ]);
                }
            }
        });

        $this->command->info(
            'Berhasil membuat 50 aturan dengan detail 10-15 per aturan.'
        );
    }
}