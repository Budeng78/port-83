<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;
use Modules\Business\Produksi\Primary\PosRajang\Services\PrimaryPos1RajangTimbangAwalService;

class PrimaryPos1RajangTimbangAwalController extends Controller
{
    public function __construct(
        protected PrimaryPos1RajangTimbangAwalService $service
    ) {
    }

    /**
     * Membuat dokumen/header timbang awal.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'no'         => ['nullable', 'integer'],
            'no_wo'      => ['required', 'string', 'max:100'],
            'jenis'      => ['required', 'string', 'max:50'],
            's_k'        => ['required', 'string', 'max:100'],
            'tara'       => ['required', 'numeric', 'min:0'],
            'jumlah_bal' => ['required', 'integer', 'min:1'],
        ]);

        $dokumen = $this->service->createHeader($validated);

        return response()->json([
            'success' => true,
            'message' => 'Dokumen timbang awal berhasil dibuat.',
            'data' => $dokumen,
        ], 201);
    }

    /**
     * Menampilkan dokumen timbang beserta cache.
     *
     * Digunakan untuk recovery proses timbang.
     */
    public function show(string $id): JsonResponse
    {
        $dokumen = $this->service->getTimbangAktif($id);

        return response()->json([
            'success' => true,
            'data' => $dokumen,
        ]);
    }

    /**
     * Menyimpan hasil timbang ke CACHE.
     *
     * Data berat berasal dari timbangan/MQTT
     * yang dikirim oleh frontend.
     */
    public function storeCache(
        Request $request,
        string $id
    ): JsonResponse {

        $validated = $request->validate([
            'nomor_tally' => ['required', 'integer', 'min:1'],
            'berat_bruto' => ['required', 'numeric', 'min:0'],
            'tara'        => ['nullable', 'numeric', 'min:0'],
        ]);

        $cache = $this->service->simpanCache(
            $id,
            (int) $validated['nomor_tally'],
            (float) $validated['berat_bruto'],
            isset($validated['tara'])
                ? (float) $validated['tara']
                : null
        );

        return response()->json([
            'success' => true,
            'message' => 'Hasil timbang berhasil disimpan ke cache.',
            'data' => $cache,
        ], 201);
    }

    /**
     * Mengambil nomor tally berikutnya.
     */
    public function nextTally(string $id): JsonResponse
    {
        $next = $this->service->getNextTallyNumber($id);

        return response()->json([
            'success' => true,
            'data' => [
                'next_tally' => $next,
            ],
        ]);
    }


    /**
     * Menghapus satu tally dari CACHE.
     *
     * Setelah dihapus, nomor tally di bawahnya
     * otomatis bergeser agar tetap rapat.
     */
    public function deleteTally(
        string $id,
        int $nomorTally
    ): JsonResponse {

        $this->service->hapusCacheTally(
            $id,
            $nomorTally
        );

        return response()->json([
            'success' => true,
            'message' =>
                "Tally nomor {$nomorTally} berhasil dihapus.",
        ]);
    }




    /**
     * Menyelesaikan proses timbang.
     *
     * CACHE → DETAIL
     * HEADER → completed
     * CACHE → soft delete
     */
    public function finish(string $id): JsonResponse
    {
        $dokumen = $this->service->selesaiTimbang($id);

        return response()->json([
            'success' => true,
            'message' => 'Penimbangan berhasil diselesaikan.',
            'data' => $dokumen,
        ]);
    }
}