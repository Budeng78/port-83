<?php

namespace Modules\Application\Timbangan\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Pos1TargetSeeder extends Seeder
{
    public function run(): void
    {
        // Jenis Tembakau
        $jenisTbkList = ['TUR', 'MAM', 'KAP', 'SRA', 'SBY'];

        // Tahun panen
        $tahunList = ['2025', '2026'];

        // Grade
        $gradeList = ['A', 'B', 'C', 'D'];

        // Type material
        $typeList = ['krosok', 'precut'];

        // Tara berdasarkan jenis tembakau
        $taraByJenis = [
            'TUR' => 2.500,
            'MAM' => 2.300,
            'KAP' => 2.700,
            'SRA' => 2.400,
            'SBY' => 2.600,
        ];

        // Loop 5 hari
        for ($i = 4; $i >= 0; $i--) {
            $tanggal = Carbon::now()
                ->subDays($i)
                ->format('Y-m-d');

            // Jumlah aturan hari ini: 1 - 3
            $jumlahAturan = rand(1, 3);

            // Total 50 bal dibagi ke aturan
            $alokasiBal = $this->distributeBal(50, $jumlahAturan);

            // Nomor aturan acak
            $nomorAturanList = collect([1, 2, 3])
                ->shuffle()
                ->take($jumlahAturan)
                ->values();

            for ($j = 0; $j < $jumlahAturan; $j++) {
                $noAturanNum = $nomorAturanList[$j];

                // Nomor aturan
                $nomorAturan = sprintf(
                    '%02d/SPC/%s',
                    $noAturanNum,
                    Carbon::parse($tanggal)->format('Y')
                );

                // S.K
                $noSKNum = rand(1, 19);
                $skText = sprintf('%02d PAS 25', $noSKNum);

                // Jenis TBK
                $jenisTbk = $jenisTbkList[array_rand($jenisTbkList)];

                // Tahun panen
                $tahun = $tahunList[array_rand($tahunList)];

                // Grade
                $grade = $gradeList[array_rand($gradeList)];

                // Type material
                $type = $typeList[array_rand($typeList)];

                // Tara berdasarkan jenis TBK
                $tara = $taraByJenis[$jenisTbk];

                // Jumlah bal
                $jumlahBal = $alokasiBal[$j];

                DB::table('timbangan_pos1_target')->insert([
                    'id'           => (string) Str::uuid(),
                    'tanggal'      => $tanggal,
                    'nomor_aturan' => $nomorAturan,
                    'jenis_tbk'    => $jenisTbk,
                    'tahun'        => $tahun,
                    'grade'        => $grade,
                    's_k'          => $skText,
                    'type'         => $type,
                    'jumlah_bal'   => $jumlahBal,
                    'tara'         => $tara,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }
        }
    }

    /**
     * Membagi total target bal ke dalam N bagian acak.
     */
    private function distributeBal(int $total, int $count): array
    {
        if ($count === 1) {
            return [$total];
        }

        $result = [];
        $remaining = $total;

        for ($i = 0; $i < $count - 1; $i++) {
            $max = $remaining - ($count - 1 - $i);
            $val = rand(1, max(1, $max));

            $result[] = $val;
            $remaining -= $val;
        }

        $result[] = $remaining;

        return $result;
    }
}
