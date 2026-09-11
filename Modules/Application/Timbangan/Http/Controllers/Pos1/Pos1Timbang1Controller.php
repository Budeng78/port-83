<?php

namespace Modules\Application\Timbangan\Http\Controllers\Pos1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Application\Timbangan\Models\Pos1\Pos1Timbang1;
use Modules\Application\Timbangan\Models\Pos1\Pos1Timbang1Cache;
use Modules\Application\Timbangan\Models\Pos1\Target;
use Modules\Application\Timbangan\Models\Pos1\TargetAturanDetail;

class Pos1Timbang1Controller extends Controller
{
    /**
     * 1. Mengambil daftar target kerja yang belum selesai.
     */
    public function getTargetAktif()
    {
        try {
            $targetAktif = Target::query()
                ->where('status', '!=', 'finish')
                ->with([
                    'aturan.detail',
                ])
                ->orderBy('tanggal', 'asc')
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($item) {
                    $item->tanggal_formatted = $item->tanggal
                        ? $item->tanggal->format('d/m/Y')
                        : '-';

                    return $item;
                });

            return response()->json([
                'success' => true,
                'data'    => $targetAktif,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 2. Simpan / Update Stream ke Cache Staging.
     */
    public function storeStream(Request $request)
    {
        $validated = $request->validate([
            'target_id'               => 'required|uuid|exists:timbangan_pos1_target,id',
            'target_aturan_detail_id' => 'required|uuid|exists:timbangan_pos1_target_aturan_detail,id',
            'nomor_bal'               => 'required|integer|min:1',
            'berat_kotor'             => 'required|numeric|min:0',
        ]);

        $detail = TargetAturanDetail::query()
            ->where('id', $validated['target_aturan_detail_id'])
            ->whereHas('targetAturan', function ($query) use ($validated) {
                $query->where('target_id', $validated['target_id']);
            })
            ->firstOrFail();

        $cache = Pos1Timbang1Cache::withTrashed()
            ->where('target_aturan_detail_id', $validated['target_aturan_detail_id'])
            ->where('nomor_bal', $validated['nomor_bal'])
            ->first();

        if ($cache) {

            if ($cache->trashed()) {
                $cache->restore();
            }

            $cache->update([
                'target_id'   => $validated['target_id'],
                'berat_kotor' => $validated['berat_kotor'],
            ]);

        } else {

            $cache = Pos1Timbang1Cache::create([
                'id'                      => (string) Str::uuid7(),
                'target_id'              => $validated['target_id'],
                'target_aturan_detail_id' => $validated['target_aturan_detail_id'],
                'nomor_bal'              => $validated['nomor_bal'],
                'berat_kotor'            => $validated['berat_kotor'],
            ]);
        }

        $detail->update([
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Bal No. {$cache->nomor_bal} tersimpan di staging cache",
            'data'    => $cache,
        ]);
    }

    /**
     * 3. Polling Data Live Cache & Hitung Nomor Bal Berikutnya.
     *
     * Data dihitung berdasarkan Detail Aturan.
     */
    public function getLiveData(Request $request)
    {
        $request->validate([
            'target_id'               => 'required|uuid',
            'target_aturan_detail_id' => 'required|uuid',
        ]);

        $targetId = $request->target_id;
        $detailId = $request->target_aturan_detail_id;

        $cacheData = Pos1Timbang1Cache::query()
            ->where('target_id', $targetId)
            ->where('target_aturan_detail_id', $detailId)
            ->orderBy('nomor_bal', 'asc')
            ->get();

        $maxBalInCache = Pos1Timbang1Cache::query()
            ->where('target_aturan_detail_id', $detailId)
            ->max('nomor_bal') ?? 0;

        $maxBalInPerm = Pos1Timbang1::query()
            ->where('target_aturan_detail_id', $detailId)
            ->max('nomor_bal') ?? 0;

        $lastNomorBal = max(
            $maxBalInCache,
            $maxBalInPerm
        );

        $nextNomorBal = $lastNomorBal + 1;

        $activeCache = Pos1Timbang1Cache::query()
            ->where('target_aturan_detail_id', $detailId)
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
     * 4. Hapus 1 Bal dari Cache Staging.
     */
    public function deleteCache($id)
    {
        $cache = Pos1Timbang1Cache::findOrFail($id);

        $cache->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data bal di staging berhasil dihapus',
        ]);
    }

    /**
     * 5. Commit Final.
     *
     * Commit hanya menyelesaikan item/detail yang sedang ditimbang.
     */
    public function commitFinal(Request $request)
    {
        $validated = $request->validate([
            'target_id'               => 'required|uuid|exists:timbangan_pos1_target,id',
            'target_aturan_detail_id' => 'required|uuid|exists:timbangan_pos1_target_aturan_detail,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $targetId = $validated['target_id'];
            $detailId = $validated['target_aturan_detail_id'];

            $detail = TargetAturanDetail::query()
                ->where('id', $detailId)
                ->whereHas('targetAturan', function ($query) use ($targetId) {
                    $query->where('target_id', $targetId);
                })
                ->firstOrFail();

            $cacheItems = Pos1Timbang1Cache::query()
                ->where('target_id', $targetId)
                ->where('target_aturan_detail_id', $detailId)
                ->orderBy('nomor_bal')
                ->get();

            if ($cacheItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data bal di staging cache untuk item ini!',
                ], 422);
            }

            foreach ($cacheItems as $item) {
                Pos1Timbang1::updateOrCreate(
                    [
                        'target_aturan_detail_id' => $item->target_aturan_detail_id,
                        'nomor_bal'               => $item->nomor_bal,
                    ],
                    [
                        'id'          => (string) Str::uuid7(),
                        'target_id'   => $item->target_id,
                        'berat_kotor' => $item->berat_kotor,
                    ]
                );
            }

            Pos1Timbang1Cache::query()
                ->where('target_id', $targetId)
                ->where('target_aturan_detail_id', $detailId)
                ->delete();

            $jumlahDitimbang = Pos1Timbang1::query()
                ->where('target_aturan_detail_id', $detailId)
                ->count();

            $statusDetail = 'active';

            if ($jumlahDitimbang >= $detail->jumlah_bal) {
                $statusDetail = 'finish';
            }

            $detail->update([
                'status' => $statusDetail,
            ]);

            $semuaDetailSelesai = ! TargetAturanDetail::query()
                ->whereHas('targetAturan', function ($query) use ($targetId) {
                    $query->where('target_id', $targetId);
                })
                ->where('status', '!=', 'finish')
                ->exists();

            if ($semuaDetailSelesai) {
                Target::query()
                    ->where('id', $targetId)
                    ->update([
                        'status' => 'finish',
                    ]);
            } else {
                Target::query()
                    ->where('id', $targetId)
                    ->update([
                        'status' => 'active',
                    ]);
            }

            return response()->json([
                'success'          => true,
                'message'          => 'Data penimbangan berhasil disimpan permanen.',
                'jumlah_ditimbang' => $jumlahDitimbang,
                'jumlah_target'    => $detail->jumlah_bal,
                'status_detail'    => $statusDetail,
                'target_status'    => $semuaDetailSelesai
                    ? 'finish'
                    : 'active',
            ]);
        });
    }

    /**
     * 6. Bersihkan seluruh cache berdasarkan Target.
     */
    public function clearCacheByTarget($targetId)
    {
        try {
            if (!Str::isUuid($targetId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Format Target ID tidak valid.',
                ], 400);
            }

            $deletedCount = Pos1Timbang1Cache::query()
                ->where('target_id', $targetId)
                ->delete();

            return response()->json([
                'success'       => true,
                'message'       => "Seluruh cache staging ({$deletedCount} bal) berhasil dibersihkan.",
                'deleted_count' => $deletedCount,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus cache: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 7. Update Status Target.
     */
    public function updateStatus(Request $request, $targetId)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,active,finish',
        ]);

        if (!Str::isUuid($targetId)) {
            return response()->json([
                'success' => false,
                'message' => 'Format Target ID tidak valid.',
            ], 400);
        }

        $target = Target::find($targetId);

        if (!$target) {
            return response()->json([
                'success' => false,
                'message' => 'Target tidak ditemukan.',
            ], 404);
        }

        $target->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Status target berhasil diubah menjadi '{$validated['status']}'.",
            'data'    => $target,
        ]);
    }
}
