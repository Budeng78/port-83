<?php

namespace Modules\Application\Timbangan\Http\Controllers\Pos1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Application\Timbangan\Services\Pos1\Timbang2Service;

class Timbang2Controller
{
    public function __construct(
        protected Timbang2Service $service
    ) {
    }


    /**
     * Ambil Target Kerja yang sudah memiliki data Timbang 1.
     */
    public function getTargetTimbang1(): JsonResponse
    {
        $data =
            $this->service->getTargetTimbang1();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }


    /**
     * Ambil data Timbang 1 berdasarkan target dan detail.
     */
    public function getTimbang1(
        string $targetId,
        string $detailId
    ): JsonResponse {

        $data =
            $this->service->getTimbang1(
                $targetId,
                $detailId
            );

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }


    /**
     * Simpan timbang karung ke cache.
     */
    public function storeStream(
        Request $request
    ): JsonResponse {

        $data =
            $request->validate([
                'target_id' => [
                    'required',
                    'uuid',
                ],

                'target_aturan_detail_id' => [
                    'required',
                    'uuid',
                ],

                'nomor_karung' => [
                    'required',
                    'integer',
                    'min:1',
                ],

                'berat_kotor' => [
                    'required',
                    'numeric',
                    'min:0',
                ],
            ]);

        $cache =
            $this->service->storeStream(
                $data
            );

        return response()->json([
            'success' => true,
            'message' =>
                'Data timbang karung berhasil disimpan.',
            'data' => $cache,
        ]);
    }


    /**
     * Ambil data timbang karung yang masih berada di cache.
     */
    public function getLiveData(
        string $targetId,
        string $detailId
    ): JsonResponse {

        $data =
            $this->service->getLiveData(
                $targetId,
                $detailId
            );

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }


    /**
     * Hapus satu data timbang karung dari cache.
     */
    public function deleteCache(
        string $id
    ): JsonResponse {

        $this->service->deleteCache(
            $id
        );

        return response()->json([
            'success' => true,
            'message' =>
                'Data timbang karung berhasil dihapus.',
        ]);
    }


    /**
     * Hapus seluruh cache berdasarkan target.
     */
    public function clearCacheByTarget(
        string $targetId
    ): JsonResponse {

        $count =
            $this->service->clearCacheByTarget(
                $targetId
            );

        return response()->json([
            'success' => true,
            'message' =>
                'Cache timbang karung berhasil dibersihkan.',
            'deleted' => $count,
        ]);
    }


    /**
     * Commit seluruh cache menjadi data permanen.
     */
    public function commitFinal(
        Request $request
    ): JsonResponse {

        $data =
            $request->validate([
                'target_id' => [
                    'required',
                    'uuid',
                ],

                'target_aturan_detail_id' => [
                    'required',
                    'uuid',
                ],
            ]);

        $count =
            $this->service->commitFinal(
                $data['target_id'],
                $data['target_aturan_detail_id']
            );

        return response()->json([
            'success' => true,
            'message' =>
                'Data timbang karung berhasil disimpan permanen.',
            'count' => $count,
        ]);
    }
}
