<?php

namespace Modules\Application\Timbangan\Services\Pos1;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

use Modules\Application\Timbangan\Models\Pos1\Target;


class Pos1TargetService
{

    /**
     * Get all target
     */
    public function getAll(?string $tanggal = null): Collection
    {
        return Target::with([
                'aturan.detail'
            ])
            ->when(
                $tanggal,
                fn ($query) => $query->where('tanggal', $tanggal)
            )
            ->latest()
            ->get();
    }



    /**
     * Get detail target
     */
    public function getById(string $id): Target
    {
        return Target::with([
            'aturan.detail'
        ])
        ->findOrFail($id);
    }




    /**
     * Create Target
     *
     * Struktur data:
     *
     * [
     *  kode_batch,
     *  tanggal,
     *
     *  aturan => [
     *      [
     *          nomor_aturan,
     *
     *          detail => [
     *              type,
     *              jenis_tbk,
     *              tahun,
     *              grade,
     *              s_k,
     *              jumlah_bal,
     *              tara
     *          ]
     *      ]
     *  ]
     * ]
     */
    public function create(array $data): Target
    {

        return DB::transaction(function () use ($data) {


            /**
             * Level 1
             */
            $target = Target::create([

                'kode_batch'
                    => $data['kode_batch'],

                'tanggal'
                    => $data['tanggal'],

                'status'
                    => $data['status'] ?? 'pending',

            ]);




            /**
             * Level 2
             */
            foreach ($data['aturan'] as $aturanData) {


                $aturan = $target->aturan()
                    ->create([

                        'nomor_aturan'
                            => $aturanData['nomor_aturan'],

                    ]);




                /**
                 * Level 3
                 */
                foreach ($aturanData['detail'] as $detailData) {


                    $aturan->detail()
                        ->create([

                            'type'
                                => $detailData['type'],

                            'jenis_tbk'
                                => $detailData['jenis_tbk'],

                            'tahun'
                                => $detailData['tahun'],

                            'grade'
                                => $detailData['grade'] ?? null,

                            's_k'
                                => $detailData['s_k'] ?? null,

                            'jumlah_bal'
                                => $detailData['jumlah_bal'],

                            'tara'
                                => $detailData['tara'],

                        ]);

                }

            }


            return $target->load([
                'aturan.detail'
            ]);

        });

    }




    /**
     * Update target
     */
    public function update(
        string $id,
        array $data
    ): Target {


        return DB::transaction(function () use ($id, $data) {


            $target = Target::findOrFail($id);



            /**
             * Update header
             */
            $target->update([

                'tanggal'
                    => $data['tanggal'],

                'status'
                    => $data['status'],

            ]);



            /**
             * Hapus detail lama
             */
            foreach ($target->aturan as $aturan) {


                foreach ($aturan->detail as $detail) {

                    $detail->delete();

                }


                $aturan->delete();

            }




            /**
             * Insert ulang aturan baru
             */
            foreach ($data['aturan'] as $aturanData) {


                $aturan = $target->aturan()
                    ->create([

                        'nomor_aturan'
                            => $aturanData['nomor_aturan'],

                    ]);



                foreach ($aturanData['detail'] as $detailData) {


                    $aturan->detail()
                        ->create($detailData);

                }

            }



            return $target->load([
                'aturan.detail'
            ]);

        });

    }





    /**
     * Delete target
     */
    public function delete(string $id): void
    {

        DB::transaction(function () use ($id) {


            $target = Target::with([
                'aturan.detail'
            ])
            ->findOrFail($id);



            foreach ($target->aturan as $aturan) {


                foreach ($aturan->detail as $detail) {

                    $detail->delete();

                }


                $aturan->delete();

            }



            $target->delete();


        });

    }





    /**
     * Generate kode batch
     */
    public function generateBatchCode(string $tanggal): string
    {

        $dateFormatted = date(
            'Ymd',
            strtotime($tanggal)
        );


        $latestBatch = Target::whereDate(
                'tanggal',
                $tanggal
            )
            ->where(
                'kode_batch',
                'LIKE',
                "BATCH-{$dateFormatted}-%"
            )
            ->orderBy(
                'kode_batch',
                'desc'
            )
            ->first();



        if ($latestBatch) {


            $lastNum = (int) substr(
                $latestBatch->kode_batch,
                -3
            );


            $nextNum = str_pad(
                $lastNum + 1,
                3,
                '0',
                STR_PAD_LEFT
            );


        } else {


            $nextNum = '001';

        }



        return "BATCH-{$dateFormatted}-{$nextNum}";
    }

}