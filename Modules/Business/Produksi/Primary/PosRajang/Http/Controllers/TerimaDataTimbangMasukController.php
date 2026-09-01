<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Modules\Business\Produksi\Primary\PosRajang\Http\Requests\TerimaDataTimbangMasukRequest;

class TerimaDataTimbangMasukController
{
    private const CACHE_KEY = 'timbangan.posrajang.penerimaan';

    /**
     * Node-RED → Laravel
     */
    public function store(
        TerimaDataTimbangMasukRequest $request
    ): JsonResponse {
        $data = [
            'berat' => $request->berat(),
            'received_at' => now()->toIso8601String(),
        ];

        Cache::forever(self::CACHE_KEY, $data);

        return response()->json([
            'success' => true,
            'message' => 'Data timbang diterima.',
            'data' => $data,
        ]);
    }

    /**
     * React → Laravel
     *
     * Hanya mengembalikan data yang BELUM dibaca.
     * Setelah dikirim ke React, data langsung dihapus.
     */
    public function show(): JsonResponse
    {
        $data = Cache::pull(self::CACHE_KEY);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}