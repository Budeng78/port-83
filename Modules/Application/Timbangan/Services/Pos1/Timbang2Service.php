<?php

namespace Modules\Application\Timbangan\Services\Pos1;

use Illuminate\Support\Facades\DB;
use Modules\Application\Timbangan\Models\Pos1\Pos1Timbang1;
use Modules\Application\Timbangan\Models\Pos1\Target;
use Modules\Application\Timbangan\Models\Pos1\Timbang2;
use Modules\Application\Timbangan\Models\Pos1\Timbang2Cache;

class Timbang2Service
{

    /**
     * Ambil kelompok detail aturan yang masih memiliki
     * data Timbang 1 dengan status pending.
     */
    public function getTargetTimbang1()
    {
        return Pos1Timbang1::query()
            ->where('status_rajang', 'pending')
            ->with('targetAturanDetail')
            ->get()
            ->groupBy('target_aturan_detail_id')
            ->map(function ($items) {

                $first =
                    $items->first();

                $detail =
                    $first->targetAturanDetail;

                return [
                    'target_id' =>
                        $first->target_id,

                    'detail_id' =>
                        $first->target_aturan_detail_id,

                    'jenis_tbk' =>
                        $detail?->jenis_tbk,

                    'tahun' =>
                        $detail?->tahun,

                    'grade' =>
                        $detail?->grade,

                    's_k' =>
                        $detail?->s_k,

                    'jumlah_bal' =>
                        $detail?->jumlah_bal,

                    'jumlah_pending' =>
                        $items->count(),
                ];
            })
            ->values()
            ->toArray();
    }


    /**
     * Ambil data Timbang 1 berdasarkan target dan detail aturan.
     */
    public function getTimbang1(
        string $targetId,
        string $detailId
    ) {
        return Pos1Timbang1::query()
            ->where('target_id', $targetId)
            ->where('target_aturan_detail_id', $detailId)
            ->orderBy('nomor_bal')
            ->get();
    }


    /**
     * Simpan hasil timbang karung ke staging/cache.
     */
    public function storeStream(array $data): Timbang2Cache
    {
        return DB::transaction(function () use ($data) {

            return Timbang2Cache::updateOrCreate(
                [
                    'target_id' =>
                        $data['target_id'],

                    'target_aturan_detail_id' =>
                        $data['target_aturan_detail_id'],

                    'nomor_karung' =>
                        $data['nomor_karung'],
                ],
                [
                    'berat_kotor' =>
                        $data['berat_kotor'],
                ]
            );
        });
    }


    /**
     * Ambil seluruh cache untuk detail.
     */
    public function getLiveData(
        string $targetId,
        string $detailId
    ): array {
        $cacheData =
            Timbang2Cache::query()
                ->where('target_id', $targetId)
                ->where(
                    'target_aturan_detail_id',
                    $detailId
                )
                ->orderBy('nomor_karung')
                ->get();

        $activeCache =
            $cacheData->last();

        $nextNomorKarung =
            (
                (int) (
                    $cacheData->max('nomor_karung') ?? 0
                )
            ) + 1;

        return [
            'cache_data' =>
                $cacheData,

            'active_cache' =>
                $activeCache,

            'next_nomor_karung' =>
                $nextNomorKarung,
        ];
    }


    /**
     * Hapus satu data staging.
     */
    public function deleteCache(
        string $id
    ): bool {
        $cache =
            Timbang2Cache::findOrFail($id);

        return (bool) $cache->delete();
    }


    /**
     * Hapus seluruh staging berdasarkan target.
     */
    public function clearCacheByTarget(
        string $targetId
    ): int {
        return Timbang2Cache::query()
            ->where('target_id', $targetId)
            ->delete();
    }


    /**
     * Commit seluruh cache menjadi data permanen.
     */
    public function commitFinal(
        string $targetId,
        string $detailId
    ): int {
        return DB::transaction(function () use (
            $targetId,
            $detailId
        ) {

            $cacheData =
                Timbang2Cache::query()
                    ->where(
                        'target_id',
                        $targetId
                    )
                    ->where(
                        'target_aturan_detail_id',
                        $detailId
                    )
                    ->orderBy('nomor_karung')
                    ->get();

            if ($cacheData->isEmpty()) {

                throw new \RuntimeException(
                    'Belum ada data timbang karung.'
                );
            }

            $count = 0;

            foreach ($cacheData as $cache) {

                Timbang2::updateOrCreate(
                    [
                        'target_id' =>
                            $cache->target_id,

                        'target_aturan_detail_id' =>
                            $cache->target_aturan_detail_id,

                        'nomor_karung' =>
                            $cache->nomor_karung,
                    ],
                    [
                        'berat_kotor' =>
                            $cache->berat_kotor,
                    ]
                );

                $count++;
            }

            Timbang2Cache::query()
                ->where(
                    'target_id',
                    $targetId
                )
                ->where(
                    'target_aturan_detail_id',
                    $detailId
                )
                ->delete();

            return $count;
        });
    }
}
