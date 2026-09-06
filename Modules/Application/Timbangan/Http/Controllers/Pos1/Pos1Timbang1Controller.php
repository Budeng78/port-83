<?php

namespace Modules\Application\Timbangan\Http\Controllers\Pos1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\Application\Timbangan\Models\Pos1Target;
use Modules\Application\Timbangan\Models\Pos1Timbang1;
use Modules\Application\Timbangan\Models\Pos1Timbang1Cache;
use Illuminate\Support\Str;

class Pos1Timbang1Controller extends Controller
{
    /**
     * 1. Mengambil daftar target kerja yang sedang aktif
     */
    public function getTargetAktif()
    {
        try {
            $targetAktif = Pos1Target::select([
                'id',
                'tanggal',
                'jenis_tbk',
                'tahun',
                's_k',
                'jumlah_bal'
            ])
            ->where('status', '!=', 'finish')
            ->orderBy('tanggal', 'asc') // FIFO: Urutkan dari tanggal terlama ke terbaru
            ->orderBy('created_at', 'asc') // Urutan sekunder jika tanggalnya sama
            ->get()
            ->map(function ($item) {
                $item->tanggal_formatted = $item->tanggal 
                    ? $item->tanggal->format('d/m/Y') 
                    : '-';
                return $item;
            });

            return response()->json([
                'success' => true,
                'data'    => $targetAktif
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 2. Simpan/Update Stream ke Cache Staging
     */
    public function storeStream(Request $request)
    {
        $validated = $request->validate([
            'target_id'   => 'required|uuid|exists:timbangan_pos1_target,id',
            'nomor_bal'   => 'required|integer|min:1',
            'berat_kotor' => 'required|numeric|min:0',
        ]);

        $cache = Pos1Timbang1Cache::updateOrCreate(
            [
                'target_id' => $validated['target_id'],
                'nomor_bal' => $validated['nomor_bal'],
            ],
            [
                'id'          => (string) Str::uuid7(), // Sedia UUID v7 jika aksi berupa INSERT
                'berat_kotor' => $validated['berat_kotor'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Bal No. {$cache->nomor_bal} tersimpan di staging cache",
            'data'    => $cache
        ]);
    }

    /**
     * 3. Polling Data Live Cache & Hitung Nomor Bal Berikutnya
     */
    public function getLiveData(Request $request)
    {
        $request->validate([
            'target_id' => 'required|uuid',
        ]);

        $targetId = $request->target_id;

        $cacheData = Pos1Timbang1Cache::where('target_id', $targetId)
            ->orderBy('nomor_bal', 'asc')
            ->get();

        $maxBalInCache = Pos1Timbang1Cache::where('target_id', $targetId)->max('nomor_bal') ?? 0;
        $maxBalInPerm  = Pos1Timbang1::where('target_id', $targetId)->max('nomor_bal') ?? 0;

        $lastNomorBal = max($maxBalInCache, $maxBalInPerm);
        $nextNomorBal = $lastNomorBal + 1;

        $activeCache = Pos1Timbang1Cache::where('target_id', $targetId)
            ->orderBy('updated_at', 'desc')
            ->first();

        return response()->json([
            'success'        => true,
            'cache_data'     => $cacheData,
            'active_cache'   => $activeCache,
            'next_nomor_bal' => $nextNomorBal,
        ]);
    }

    /**
     * 4. Hapus 1 Bal dari Cache Staging
     */
    public function deleteCache($id)
    {
        $cache = Pos1Timbang1Cache::findOrFail($id);
        $cache->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data bal di staging berhasil dihapus'
        ]);
    }

    /**
     * 5. Commit Final
     */
    public function commitFinal(Request $request)
    {
        $request->validate([
            'target_id' => 'required|uuid|exists:timbangan_pos1_target,id',
        ]);

        return DB::transaction(function () use ($request) {
            $targetId = $request->target_id;

            $cacheItems = Pos1Timbang1Cache::where('target_id', $targetId)->get();

            if ($cacheItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data bal di staging cache untuk disimpan!'
                ], 422);
            }

            foreach ($cacheItems as $item) {
                Pos1Timbang1::updateOrCreate(
                    [
                        'target_id' => $item->target_id,
                        'nomor_bal' => $item->nomor_bal,
                    ],
                    [
                        'id'          => (string) Str::uuid7(),
                        'berat_kotor' => $item->berat_kotor,
                    ]
                );
            }

            Pos1Timbang1Cache::where('target_id', $targetId)->delete();

            // TAMBAHAN: tandai target sebagai selesai
            Pos1Target::where('id', $targetId)->update(['status' => 'finish']);

            return response()->json([
                'success' => true,
                'message' => 'Seluruh data penimbangan berhasil disimpan permanen!'
            ]);
        });
    }

    public function clearCacheByTarget($targetId)
    {
        try {
            // Validasi format UUID target_id agar tidak invalid query
            if (!Str::isUuid($targetId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Format Target ID tidak valid.'
                ], 400);
            }

            // Hapus menggunakan Eloquent Model langsung
            $deletedCount = Pos1Timbang1Cache::where('target_id', $targetId)->delete();

            return response()->json([
                'success'       => true,
                'message'       => "Seluruh cache staging ({$deletedCount} bal) berhasil dibersihkan.",
                'deleted_count' => $deletedCount
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus cache: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $targetId)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,active,finish',
        ]);

        if (!Str::isUuid($targetId)) {
            return response()->json([
                'success' => false,
                'message' => 'Format Target ID tidak valid.'
            ], 400);
        }

        $target = Pos1Target::find($targetId);

        if (!$target) {
            return response()->json([
                'success' => false,
                'message' => 'Target tidak ditemukan.'
            ], 404);
        }

        $target->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => "Status target berhasil diubah menjadi '{$validated['status']}'.",
            'data'    => $target
        ]);
    }

}