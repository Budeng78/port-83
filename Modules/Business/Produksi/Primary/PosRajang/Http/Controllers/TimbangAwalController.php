<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TimbangAwalController extends Controller
{
    private const HEADER = 'primary_pos1_rajang_dokumen_timbang_awal';
    private const CACHE = 'primary_pos1_rajang_dokumen_timbang_awal_detail_cache';
    private const DETAIL = 'primary_pos1_rajang_dokumen_timbang_awal_detail';

    public function connectAndInit(Request $request)
    {
        $data = $request->validate([
            'no' => 'required|integer|min:1',
            'no_wo' => 'required|string|max:50',
            'jenis' => 'required|string|max:50',
            's_k' => 'required|string|max:50',
            'tara' => 'required|numeric|min:0',
            'jumlah_bal' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            $existing = DB::table(self::HEADER)
                ->where('no_wo', $data['no_wo'])
                ->where('jenis', $data['jenis'])
                ->where('s_k', $data['s_k'])
                ->whereIn('status', ['draft', 'in_progress'])
                ->whereNull('deleted_at')
                ->latest()
                ->first();

            if ($existing) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen timbang awal sudah ada.',
                    'data' => ['dokumen_timbang_awal' => $existing],
                ], 409);
            }

            $id = (string) Str::uuid();

            DB::table(self::HEADER)->insert([
                'id' => $id,
                'no' => $data['no'],
                'no_wo' => $data['no_wo'],
                'jenis' => $data['jenis'],
                's_k' => $data['s_k'],
                'tara' => $data['tara'],
                'jumlah_bal' => $data['jumlah_bal'],
                'status' => 'in_progress',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $cache = $this->createCache($id, 1, $data['tara']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sesi penimbangan berhasil diinisiasi.',
                'data' => [
                    'dokumen_timbang_awal' => DB::table(self::HEADER)->where('id', $id)->first(),
                    'cache' => $cache,
                    'next_pack' => 1,
                    'jumlah_tertimbang' => 0,
                    'jumlah_bal' => $data['jumlah_bal'],
                ],
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Gagal inisiasi timbang awal.', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menginisiasi penimbangan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeKarung(Request $request)
    {
        $data = $request->validate([
            'dokumen_timbang_awal_id' => 'required|uuid|exists:' . self::HEADER . ',id',
            'nomor_pack' => 'required|integer|min:1',
            'berat_bruto' => 'required|numeric|min:0',
            'tara' => 'required|numeric|min:0',
            'berat_netto' => 'required|numeric',
            'waktu_timbang' => 'nullable|date',
        ]);

        DB::beginTransaction();

        try {
            $id = $data['dokumen_timbang_awal_id'];
            $nomor = (int) $data['nomor_pack'];

            $dokumen = DB::table(self::HEADER)
                ->where('id', $id)
                ->whereNull('deleted_at')
                ->lockForUpdate()
                ->first();

            if (!$dokumen) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Dokumen timbang awal tidak ditemukan.'], 404);
            }

            if ($dokumen->status !== 'in_progress') {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Sesi penimbangan sudah selesai.'], 409);
            }

            $jumlah = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $id)
                ->whereNull('deleted_at')
                ->count();

            $next = $jumlah + 1;

            $existing = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $id)
                ->where('nomor_pack', $nomor)
                ->whereNull('deleted_at')
                ->first();

            if ($existing) {
                DB::commit();
                return response()->json([
                    'success' => true,
                    'already_saved' => true,
                    'message' => "pack ke-{$nomor} sudah tersimpan.",
                    'data' => [
                        'detail' => $existing,
                        'next_pack' => $next,
                        'jumlah_tertimbang' => $jumlah,
                    ],
                ]);
            }

            if ($nomor !== $next) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Nomor pack tidak sesuai urutan.',
                    'data' => [
                        'nomor_pack_dikirim' => $nomor,
                        'nomor_pack_berikutnya' => $next,
                    ],
                ], 409);
            }

            $detailId = (string) Str::uuid();

            DB::table(self::DETAIL)->insert([
                'id' => $detailId,
                'dokumen_timbang_awal_id' => $id,
                'nomor_pack' => $nomor,
                'berat_bruto' => $data['berat_bruto'],
                'tara' => $data['tara'],
                'berat_netto' => $data['berat_netto'],
                'waktu_timbang' => $data['waktu_timbang'] ?? now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table(self::CACHE)
                ->where('dokumen_timbang_awal_id', $id)
                ->where('nomor_pack', $nomor)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => now(),
                    'deleted_by' => auth()->id(),
                    'updated_at' => now(),
                ]);

            $next++;
            $cache = $this->createCache($id, $next, $dokumen->tara);
            $jumlah++;

            DB::commit();

            return response()->json([
                'success' => true,
                'already_saved' => false,
                'message' => "pack ke-{$nomor} berhasil disimpan.",
                'data' => [
                    'detail' => DB::table(self::DETAIL)->where('id', $detailId)->first(),
                    'cache' => $cache,
                    'next_pack' => $next,
                    'jumlah_tertimbang' => $jumlah,
                    'jumlah_bal' => (int) $dokumen->jumlah_bal,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Gagal menyimpan pack.', [
                'dokumen_timbang_awal_id' => $data['dokumen_timbang_awal_id'] ?? null,
                'nomor_pack' => $data['nomor_pack'] ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data pack.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function cariBatch(Request $request)
    {
        $data = $request->validate([
            'no_wo' => 'required|string|max:50',
            'jenis' => 'required|string|max:50',
            's_k' => 'required|string|max:50',
        ]);

        try {
            $dokumen = DB::table(self::HEADER)
                ->where('no_wo', $data['no_wo'])
                ->where('jenis', $data['jenis'])
                ->where('s_k', $data['s_k'])
                ->where('status', 'in_progress')
                ->whereNull('deleted_at')
                ->latest()
                ->first();

            if (!$dokumen) {
                return response()->json([
                    'success' => true,
                    'found' => false,
                    'message' => 'Tidak ada dokumen timbang aktif.',
                    'data' => null,
                ]);
            }

            $details = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $dokumen->id)
                ->whereNull('deleted_at')
                ->orderBy('nomor_pack')
                ->get();

            $jumlah = $details->count();
            $next = $jumlah + 1;

            DB::table(self::CACHE)
                ->where('dokumen_timbang_awal_id', $dokumen->id)
                ->whereNull('deleted_at')
                ->delete();

            $cache = $this->createCache($dokumen->id, $next, $dokumen->tara);

            return response()->json([
                'success' => true,
                'found' => true,
                'message' => 'Dokumen timbang aktif ditemukan.',
                'data' => [
                    'dokumen_timbang_awal' => $dokumen,
                    'cache' => $cache,
                    'details' => $details,
                    'next_pack' => $next,
                    'jumlah_tertimbang' => $jumlah,
                    'jumlah_bal' => (int) $dokumen->jumlah_bal,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal recovery timbang awal.', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'found' => false,
                'message' => 'Gagal mencari dokumen timbang.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteKarung(Request $request)
    {
        $data = $request->validate([
            'dokumen_timbang_awal_id' => 'required|uuid|exists:' . self::HEADER . ',id',
            'nomor_pack' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            $id = $data['dokumen_timbang_awal_id'];
            $nomor = (int) $data['nomor_pack'];

            /*
            |--------------------------------------------------------------------------
            | LOCK HEADER
            |--------------------------------------------------------------------------
            */
            $dokumen = DB::table(self::HEADER)
                ->where('id', $id)
                ->whereNull('deleted_at')
                ->lockForUpdate()
                ->first();

            if (!$dokumen) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen timbang awal tidak ditemukan.',
                ], 404);
            }

            if ($dokumen->status !== 'in_progress') {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Sesi penimbangan sudah selesai.',
                ], 409);
            }

            /*
            |--------------------------------------------------------------------------
            | CARI DETAIL YANG AKAN DIHAPUS
            |--------------------------------------------------------------------------
            */
            $detail = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $id)
                ->where('nomor_pack', $nomor)
                ->whereNull('deleted_at')
                ->lockForUpdate()
                ->first();

            if (!$detail) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => "pack ke-{$nomor} tidak ditemukan.",
                ], 404);
            }

            /*
            |--------------------------------------------------------------------------
            | SOFT DELETE DETAIL
            |--------------------------------------------------------------------------
            */
            $now = now();

            DB::table(self::DETAIL)
                ->where('id', $detail->id)
                ->update([
                    'deleted_at' => $now,
                    'deleted_by' => auth()->id(),
                    'updated_at' => $now,
                ]);

            /*
            |--------------------------------------------------------------------------
            | AMBIL SEMUA DETAIL AKTIF SETELAH DELETE
            |--------------------------------------------------------------------------
            */
            $details = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $id)
                ->whereNull('deleted_at')
                ->orderBy('nomor_pack', 'asc')
                ->lockForUpdate()
                ->get();

            /*
            |--------------------------------------------------------------------------
            | RENUMBER 2 TAHAP
            |
            | Kenapa?
            |
            | Karena ada UNIQUE:
            |
            | dokumen_timbang_awal_id + nomor_pack
            |
            | Tidak boleh langsung:
            |
            | 2 -> 1
            | 3 -> 2
            |
            | karena nomor lama masih ada.
            |--------------------------------------------------------------------------
            */

            if ($details->isNotEmpty()) {

                /*
                |--------------------------------------------------------------------------
                | TAHAP 1
                | Pindahkan dulu ke nomor sementara.
                |--------------------------------------------------------------------------
                */

                $temporaryBase = 1000000;

                foreach ($details as $index => $item) {
                    DB::table(self::DETAIL)
                        ->where('id', $item->id)
                        ->update([
                            'nomor_pack' => $temporaryBase + $index + 1,
                            'updated_at' => $now,
                        ]);
                }

                /*
                |--------------------------------------------------------------------------
                | TAHAP 2
                | Kembalikan menjadi 1,2,3,4,...
                |--------------------------------------------------------------------------
                */

                foreach ($details as $index => $item) {
                    DB::table(self::DETAIL)
                        ->where('id', $item->id)
                        ->update([
                            'nomor_pack' => $index + 1,
                            'updated_at' => $now,
                        ]);
                }
            }

            /*
            |--------------------------------------------------------------------------
            | HITUNG JUMLAH AKTIF
            |--------------------------------------------------------------------------
            */
            $jumlah = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $id)
                ->whereNull('deleted_at')
                ->count();

            /*
            |--------------------------------------------------------------------------
            | pack BERIKUTNYA
            |--------------------------------------------------------------------------
            */
            $next = $jumlah + 1;

            /*
            |--------------------------------------------------------------------------
            | HAPUS / SOFT DELETE CACHE AKTIF
            |--------------------------------------------------------------------------
            */
            DB::table(self::CACHE)
                ->where('dokumen_timbang_awal_id', $id)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => $now,
                    'deleted_by' => auth()->id(),
                    'updated_at' => $now,
                ]);

            /*
            |--------------------------------------------------------------------------
            | BUAT CACHE BARU UNTUK pack BERIKUTNYA
            |--------------------------------------------------------------------------
            */
            $cache = $this->createCache(
                $id,
                $next,
                $dokumen->tara
            );

            /*
            |--------------------------------------------------------------------------
            | AMBIL DETAIL TERBARU
            |--------------------------------------------------------------------------
            */
            $latestDetails = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $id)
                ->whereNull('deleted_at')
                ->orderBy('nomor_pack', 'asc')
                ->get();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "pack ke-{$nomor} berhasil dihapus.",
                'data' => [
                    'deleted_nomor_pack' => $nomor,
                    'details' => $latestDetails,
                    'cache' => $cache,
                    'jumlah_tertimbang' => $jumlah,
                    'next_pack' => $next,
                ],
            ]);

        } catch (\Throwable $e) {

            DB::rollBack();

            Log::error('Gagal menghapus pack.', [
                'dokumen_timbang_awal_id' => $data['dokumen_timbang_awal_id'] ?? null,
                'nomor_pack' => $data['nomor_pack'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pack.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function finishSession(Request $request)
    {
        $data = $request->validate([
            'dokumen_timbang_awal_id' => 'required|uuid|exists:' . self::HEADER . ',id',
        ]);

        DB::beginTransaction();

        try {
            $dokumen = DB::table(self::HEADER)
                ->where('id', $data['dokumen_timbang_awal_id'])
                ->whereNull('deleted_at')
                ->lockForUpdate()
                ->first();

            if (!$dokumen) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Dokumen timbang awal tidak ditemukan.'], 404);
            }

            if ($dokumen->status !== 'in_progress') {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Sesi penimbangan sudah selesai.'], 409);
            }

            $jumlah = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $dokumen->id)
                ->whereNull('deleted_at')
                ->count();

            DB::table(self::HEADER)
                ->where('id', $dokumen->id)
                ->update([
                    'status' => 'completed',
                    'updated_at' => now(),
                ]);

            DB::table(self::CACHE)
                ->where('dokumen_timbang_awal_id', $dokumen->id)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => now(),
                    'deleted_by' => auth()->id(),
                    'updated_at' => now(),
                ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sesi penimbangan berhasil diselesaikan.',
                'data' => [
                    'dokumen_timbang_awal_id' => $dokumen->id,
                    'status' => 'completed',
                    'jumlah_tertimbang' => $jumlah,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Gagal menyelesaikan timbang awal.', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyelesaikan sesi penimbangan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateDraft(Request $request)
    {
        $data = $request->validate([
            'dokumen_timbang_awal_id' => 'required|uuid|exists:' . self::HEADER . ',id',
            'nomor_pack' => 'required|integer|min:1',
            'berat_bruto' => 'required|numeric|min:0',
            'tara' => 'required|numeric|min:0',
            'berat_netto' => 'required|numeric',
            'waktu_timbang' => 'nullable|date',
        ]);

        DB::beginTransaction();

        try {
            $dokumen = DB::table(self::HEADER)
                ->where('id', $data['dokumen_timbang_awal_id'])
                ->where('status', 'in_progress')
                ->whereNull('deleted_at')
                ->first();

            if (!$dokumen) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Sesi penimbangan tidak aktif.'], 409);
            }

            $cache = DB::table(self::CACHE)
                ->where('dokumen_timbang_awal_id', $dokumen->id)
                ->where('nomor_pack', $data['nomor_pack'])
                ->whereNull('deleted_at')
                ->first();

            if ($cache) {
                DB::table(self::CACHE)->where('id', $cache->id)->update([
                    'berat_bruto' => $data['berat_bruto'],
                    'tara' => $data['tara'],
                    'berat_netto' => $data['berat_netto'],
                    'waktu_timbang' => $data['waktu_timbang'] ?? now(),
                    'updated_at' => now(),
                ]);
            } else {
                $cache = $this->createCache(
                    $dokumen->id,
                    (int) $data['nomor_pack'],
                    $data['tara'],
                    $data['berat_bruto'],
                    $data['berat_netto'],
                    $data['waktu_timbang'] ?? now()
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data live timbangan berhasil diperbarui.',
                'data' => ['cache' => DB::table(self::CACHE)
                    ->where('dokumen_timbang_awal_id', $dokumen->id)
                    ->where('nomor_pack', $data['nomor_pack'])
                    ->whereNull('deleted_at')
                    ->first()],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Gagal update cache timbang awal.', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data live timbangan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function print($id)
    {
        try {
            $header = DB::table(self::HEADER)
                ->where('id', $id)
                ->whereNull('deleted_at')
                ->first();

            if (!$header) {
                abort(404, 'Dokumen timbang awal tidak ditemukan.');
            }

            $details = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $id)
                ->whereNull('deleted_at')
                ->orderBy('nomor_pack')
                ->get();

            return view('prosesck.penerimaan.print', [
                'header' => $header,
                'details' => $details,
                'totalpack' => $details->count(),
                'totalBruto' => $details->sum('berat_bruto'),
                'totalTara' => $details->sum('tara'),
                'totalNetto' => $details->sum('berat_netto'),
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal mencetak timbang awal.', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            abort(500, 'Gagal menampilkan laporan cetak.');
        }
    }

    private function createCache(
        string $dokumenId,
        int $nomorpack,
        float|int|string $tara,
        float|int|string $beratBruto = 0,
        float|int|string $beratNetto = 0,
        $waktuTimbang = null
    ) {
        $id = (string) Str::uuid();

        DB::table(self::CACHE)->insert([
            'id' => $id,
            'dokumen_timbang_awal_id' => $dokumenId,
            'nomor_pack' => $nomorpack,
            'berat_bruto' => $beratBruto,
            'tara' => $tara,
            'berat_netto' => $beratNetto,
            'waktu_timbang' => $waktuTimbang,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return DB::table(self::CACHE)->where('id', $id)->first();
    }


//==== MANAGEMEN HASIL TIMBANGAN ==== //

    public function hasilTimbangan(Request $request)
    {
        try {
            $query = DB::table(self::HEADER . ' as h')
                ->leftJoinSub(
                    DB::table(self::DETAIL)
                        ->select(
                            'dokumen_timbang_awal_id',
                            DB::raw('COUNT(*) as jumlah_pack'),
                            DB::raw('SUM(berat_bruto) as total_bruto'),
                            DB::raw('SUM(tara) as total_tara'),
                            DB::raw('SUM(berat_netto) as total_netto')
                        )
                        ->whereNull('deleted_at')
                        ->groupBy('dokumen_timbang_awal_id'),
                    'd',
                    'd.dokumen_timbang_awal_id',
                    '=',
                    'h.id'
                )
                ->where('h.status', 'completed')
                ->whereNull('h.deleted_at')
                ->select([
                    'h.id',
                    'h.no',
                    'h.no_wo',
                    'h.jenis',
                    'h.s_k',
                    'h.tara',
                    'h.jumlah_bal',
                    'h.status',
                    'h.created_at',
                    'h.updated_at',

                    DB::raw('COALESCE(d.jumlah_pack, 0) as jumlah_pack'),
                    DB::raw('COALESCE(d.total_bruto, 0) as total_bruto'),
                    DB::raw('COALESCE(d.total_tara, 0) as total_tara'),
                    DB::raw('COALESCE(d.total_netto, 0) as total_netto'),
                ]);

            /*
            |--------------------------------------------------------------------------
            | SEARCH
            |--------------------------------------------------------------------------
            */

            if ($request->filled('search')) {
                $search = trim($request->search);

                $query->where(function ($q) use ($search) {
                    $q->where('h.no_wo', 'like', "%{$search}%")
                        ->orWhere('h.no', 'like', "%{$search}%")
                        ->orWhere('h.jenis', 'like', "%{$search}%")
                        ->orWhere('h.s_k', 'like', "%{$search}%");
                });
            }

            /*
            |--------------------------------------------------------------------------
            | FILTER JENIS
            |--------------------------------------------------------------------------
            */

            if ($request->filled('jenis')) {
                $query->where('h.jenis', $request->jenis);
            }

            /*
            |--------------------------------------------------------------------------
            | FILTER S/K
            |--------------------------------------------------------------------------
            */

            if ($request->filled('s_k')) {
                $query->where('h.s_k', $request->s_k);
            }

            /*
            |--------------------------------------------------------------------------
            | PAGINATION
            |--------------------------------------------------------------------------
            */

            $perPage = min(
                max($request->integer('per_page', 15), 1),
                100
            );

            $data = $query
                ->orderByDesc('h.updated_at')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);

        } catch (\Throwable $e) {

            Log::error('Gagal mengambil manajemen hasil timbang.', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil hasil timbangan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function detailHasilTimbangan(string $id)
    {
        try {

            $header = DB::table(self::HEADER)
                ->where('id', $id)
                ->where('status', 'completed')
                ->whereNull('deleted_at')
                ->first();

            if (!$header) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hasil timbangan tidak ditemukan.',
                ], 404);
            }

            $details = DB::table(self::DETAIL)
                ->where('dokumen_timbang_awal_id', $id)
                ->whereNull('deleted_at')
                ->orderBy('nomor_pack')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'dokumen_timbang_awal' => $header,
                    'details' => $details,
                    'ringkasan' => [
                        'jumlah_pack' => $details->count(),
                        'total_bruto' => $details->sum('berat_bruto'),
                        'total_tara' => $details->sum('tara'),
                        'total_netto' => $details->sum('berat_netto'),
                    ],
                ],
            ]);

        } catch (\Throwable $e) {

            Log::error('Gagal mengambil detail hasil timbang.', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail hasil timbangan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }







}

