<?php

namespace App\Http\Controllers\Api\Primary\Prosesck\Penerimaan;

use App\Http\Controllers\Controller;
use App\Models\BaseModel; // Mengingat base model bernama BaseModel sesuai kesepakatan
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PenerimaanCkMentahController extends Controller
{
    /**
     * Inisiasi data Surat Jalan dan buka sesi Draft Penimbangan saat klik "Connect"
     */
    public function connectAndInit(Request $request)
    {
        // Validasi input awal dari form Surat Jalan
        $validated = $request->validate([
            'penerimaan_id'      => 'nullable|string', // Relasi ke Surat Kirim jika ada
            'kode'               => 'required|string|unique:primary_prosesck_penerimaan_ckmentah_batch,kode',
            'tanggal_penerimaan' => 'required|date',
            'jumlah_karung'      => 'required|integer|min:1',
            'nama_sopir'         => 'required|string|max:255',
            'no_kendaraan'       => 'required|string|max:50',
        ]);

        // Gunakan Database Transaction agar data batch utama dan draft sinkron
        DB::beginTransaction();

        try {
            // Generate UUID untuk ID tabel batch dan draft
            $batchId = (string) Str::uuid(); // Atau gunakan generator uuid7() jika sudah diatur di project
            $draftId = (string) Str::uuid();

            // 1. Simpan data utama Surat Jalan ke tabel batch
            DB::table('primary_prosesck_penerimaan_ckmentah_batch')->insert([
                'id'                 => $batchId,
                'penerimaan_id'      => $validated['penerimaan_id'] ?? null,
                'kode'               => $validated['kode'],
                'tanggal_penerimaan' => $validated['tanggal_penerimaan'],
                'jumlah_karung'      => $validated['jumlah_karung'],
                'nama_sopir'         => $validated['nama_sopir'],
                'no_kendaraan'       => $validated['no_kendaraan'],
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);

            // 2. Buat inisiasi sesi ke tabel draft penimbangan untuk koneksi MQTT
            DB::table('primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft')->insert([
                'id'                      => $draftId,
                'kiriman_id'              => $batchId, // Menghubungkan ke ID batch yang baru dibuat
                'nomor_karung_berikutnya' => 1,          // Mulai dari karung pertama
                'berat_bruto'             => 0.00,
                'tara'                    => 0.00,
                'berat_netto'             => 0.00,
                'status'                  => 'in_progress',
                'last_heartbeat'          => now(),
                'created_at'              => now(),
                'updated_at'              => now(),
            ]);

            DB::commit();

            // Ambil data yang sudah terbentuk untuk dikembalikan ke Frontend (React)
            $batchData = DB::table('primary_prosesck_penerimaan_ckmentah_batch')->where('id', $batchId)->first();
            $draftData = DB::table('primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft')->where('id', $draftId)->first();

            return response()->json([
                'success' => true,
                'message' => 'Koneksi berhasil diinisiasi, sesi penimbangan aktif.',
                'data' => [
                    'batch' => $batchData,
                    'draft' => $draftData,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal inisiasi penimbangan: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat menghubungkan timbangan.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // =====================================================
    // store
    // =====================================================

    public function storeKarung(Request $request)
    {
        $validated = $request->validate([
            'kiriman_id'   => 'required|string|exists:primary_prosesck_penerimaan_ckmentah_batch,id',
            'kode_barang'  => 'required|string',
            'nomor_karung' => 'required|integer|min:1',
            'berat_bruto'  => 'required|numeric|min:0',
            'tara'         => 'required|numeric|min:0',
            'berat_netto'  => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {

            // =====================================================
            // 1. AMBIL BATCH
            // =====================================================

            $batch = DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch'
            )
                ->where('id', $validated['kiriman_id'])
                ->lockForUpdate()
                ->first();


            if (!$batch) {

                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Batch tidak ditemukan.',
                ], 404);
            }


            // =====================================================
            // 2. AMBIL DRAFT
            // =====================================================

            $draft = DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft'
            )
                ->where('kiriman_id', $validated['kiriman_id'])
                ->where('status', 'in_progress')
                ->lockForUpdate()
                ->first();


            if (!$draft) {

                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Sesi penimbangan tidak aktif atau sudah selesai.',
                ], 409);
            }


            // =====================================================
            // 3. CEK APAKAH NOMOR KARUNG SUDAH PERNAH DISIMPAN
            // =====================================================

            $existing = DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch_penimbangan'
            )
                ->where('kiriman_id', $validated['kiriman_id'])
                ->where('nomor_karung', $validated['nomor_karung'])
                ->first();


            if ($existing) {

                DB::commit();

                return response()->json([
                    'success' => true,
                    'already_saved' => true,
                    'message' =>
                        'Karung ke-' .
                        $validated['nomor_karung'] .
                        ' sudah tersimpan sebelumnya.',
                    'data' => [
                        'penimbangan' => $existing,
                        'draft' => $draft,
                    ],
                ], 200);
            }


            // =====================================================
            // 4. CEK NOMOR KARUNG HARUS SESUAI DRAFT
            // =====================================================

            $nomorBerikutnya = (int) $draft->nomor_karung_berikutnya;

            $nomorKarung = (int) $validated['nomor_karung'];


            if ($nomorKarung !== $nomorBerikutnya) {

                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Nomor karung tidak sesuai urutan.',
                    'data' => [
                        'nomor_karung_dikirim' => $nomorKarung,
                        'nomor_karung_berikutnya' => $nomorBerikutnya,
                    ],
                ], 409);
            }


            // =====================================================
            // 5. CEK JANGAN MELEBIHI JUMLAH KARUNG
            // =====================================================

            $jumlahKarung = (int) $batch->jumlah_karung;


            if ($nomorKarung > $jumlahKarung) {

                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Jumlah karung sudah mencapai batas batch.',
                    'data' => [
                        'jumlah_karung' => $jumlahKarung,
                        'nomor_karung' => $nomorKarung,
                    ],
                ], 422);
            }


            // =====================================================
            // 6. SIMPAN PENIMBANGAN
            // =====================================================

            $penimbanganId = (string) Str::uuid();

            DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch_penimbangan'
            )->insert([
                'id'           => $penimbanganId,
                'kiriman_id'   => $validated['kiriman_id'],
                'kode_barang'  => $validated['kode_barang'],
                'nomor_karung' => $nomorKarung,
                'berat_bruto'  => $validated['berat_bruto'],
                'tara'         => $validated['tara'],
                'berat_netto'  => $validated['berat_netto'],
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);


            // =====================================================
            // 7. NOMOR KARUNG BERIKUTNYA
            // =====================================================

            $nextKarung = $nomorKarung + 1;


            // =====================================================
            // 8. UPDATE DRAFT
            // =====================================================

            DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft'
            )
                ->where('kiriman_id', $validated['kiriman_id'])
                ->update([
                    'nomor_karung_berikutnya' => $nextKarung,

                    // Reset berat live
                    'berat_bruto' => 0.00,
                    'tara'        => 0.00,
                    'berat_netto' => 0.00,

                    'last_heartbeat' => now(),
                    'updated_at'     => now(),
                ]);


            // =====================================================
            // 9. CEK APAKAH BATCH SUDAH SELESAI
            // =====================================================

            if ($nextKarung > $jumlahKarung) {

                DB::table(
                    'primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft'
                )
                    ->where('kiriman_id', $validated['kiriman_id'])
                    ->update([
                        'status'     => 'completed',
                        'updated_at' => now(),
                    ]);
            }


            DB::commit();


            // =====================================================
            // 10. AMBIL DRAFT TERBARU
            // =====================================================

            $updatedDraft = DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft'
            )
                ->where('kiriman_id', $validated['kiriman_id'])
                ->first();


            // =====================================================
            // 11. RESPONSE
            // =====================================================

            return response()->json([
                'success' => true,
                'already_saved' => false,

                'message' =>
                    'Karung ke-' .
                    $nomorKarung .
                    ' berhasil disimpan.',

                'data' => [
                    'penimbangan' => [
                        'id'           => $penimbanganId,
                        'kiriman_id'   => $validated['kiriman_id'],
                        'kode_barang'  => $validated['kode_barang'],
                        'nomor_karung' => $nomorKarung,
                        'berat_bruto'  => $validated['berat_bruto'],
                        'tara'         => $validated['tara'],
                        'berat_netto'  => $validated['berat_netto'],
                    ],

                    'draft' => $updatedDraft,

                    'next_karung' => $nextKarung,

                    'jumlah_karung' => $jumlahKarung,
                ],

            ], 200);


        } catch (\Exception $e) {

            DB::rollBack();

            Log::error(
                'Gagal menyimpan karung: ' .
                $e->getMessage(),
                [
                    'kiriman_id'   => $validated['kiriman_id'] ?? null,
                    'nomor_karung' => $validated['nomor_karung'] ?? null,
                ]
            );


            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data karung.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // =====================================================
    // CARI BATCH AKTIF / RECOVERY
    // =====================================================
    public function cariBatch(Request $request)
    {
        $validated = $request->validate([
            'tanggal_penerimaan' => 'required|date',
            'no_kendaraan'       => 'required|string|max:50',
        ]);

        try {

            // =====================================================
            // 1. CARI BATCH YANG MASIH IN_PROGRESS
            // =====================================================

            $batch = DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch as b'
            )
                ->join(
                    'primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft as d',
                    'd.kiriman_id',
                    '=',
                    'b.id'
                )
                ->whereDate(
                    'b.tanggal_penerimaan',
                    $validated['tanggal_penerimaan']
                )
                ->where(
                    'b.no_kendaraan',
                    $validated['no_kendaraan']
                )
                ->where(
                    'd.status',
                    'in_progress'
                )
                ->orderByDesc(
                    'b.created_at'
                )
                ->select(
                    'b.*'
                )
                ->first();


            // =====================================================
            // 2. TIDAK ADA BATCH AKTIF
            //    → BUKAN ERROR
            //    → FRONTEND BOLEH CREATE BATCH BARU
            // =====================================================

            if (!$batch) {

                return response()->json([

                    'success' => true,

                    'found' => false,

                    'message' =>
                        'Tidak ada batch aktif. Silakan membuat batch baru.',

                    'data' => null,

                ], 200);
            }


            // =====================================================
            // 3. AMBIL DRAFT AKTIF
            // =====================================================

            $draft = DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft'
            )
                ->where(
                    'kiriman_id',
                    $batch->id
                )
                ->where(
                    'status',
                    'in_progress'
                )
                ->latest(
                    'created_at'
                )
                ->first();


            // =====================================================
            // 4. VALIDASI DRAFT
            // =====================================================

            if (!$draft) {

                return response()->json([

                    'success' => false,

                    'found' => true,

                    'message' =>
                        'Batch ditemukan tetapi draft penimbangan aktif tidak ditemukan.',

                    'data' => [

                        'batch' => $batch,

                    ],

                ], 409);
            }


            // =====================================================
            // 5. AMBIL SEMUA TALLY YANG SUDAH TERSIMPAN
            // =====================================================

            $details = DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch_penimbangan'
            )
                ->where(
                    'kiriman_id',
                    $batch->id
                )
                ->orderBy(
                    'nomor_karung'
                )
                ->get();


            // =====================================================
            // 6. NOMOR KARUNG BERIKUTNYA
            // =====================================================

            $nextKarung =
                (int) $draft->nomor_karung_berikutnya;


            // =====================================================
            // 7. JUMLAH KARUNG YANG SUDAH TERSIMPAN
            // =====================================================

            $jumlahTertimbang =
                $details->count();


            // =====================================================
            // 8. RESPONSE RECOVERY
            // =====================================================

            return response()->json([

                'success' => true,

                'found' => true,

                'message' =>
                    'Batch aktif berhasil ditemukan dan siap dilanjutkan.',

                'data' => [

                    'batch' => $batch,

                    'draft' => $draft,

                    'details' => $details,

                    'next_karung' =>
                        $nextKarung,

                    'jumlah_tertimbang' =>
                        $jumlahTertimbang,

                    'jumlah_karung' =>
                        (int) $batch->jumlah_karung,

                ],

            ], 200);


        } catch (\Exception $e) {

            Log::error(
                'Gagal mencari batch recovery: ' .
                $e->getMessage()
            );

            return response()->json([

                'success' => false,

                'found' => false,

                'message' =>
                    'Gagal mencari batch.',

                'error' =>
                    $e->getMessage(),

            ], 500);
        }
    }





    /**
     * Menyelesaikan sesi penimbangan batch
     */
    public function finishSession(Request $request)
    {
        $validated = $request->validate([
            'kiriman_id' => 'required|string|exists:primary_prosesck_penerimaan_ckmentah_batch,id',
        ]);

        try {
            // Ubah status draft menjadi completed atau hapus sesi draft-nya
            DB::table('primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft')
                ->where('kiriman_id', $validated['kiriman_id'])
                ->update([
                    'status'     => 'completed',
                    'updated_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Sesi penimbangan berhasil diselesaikan.',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal menyelesaikan sesi: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function updateDraft(Request $request)
    {
        $validated = $request->validate([
            'kiriman_id'  => 'required|string|exists:primary_prosesck_penerimaan_ckmentah_batch,id',
            'berat_bruto' => 'required|numeric',
            'tara'        => 'required|numeric',
            'berat_netto' => 'required|numeric',
        ]);

        try {
            DB::table('primary_prosesck_penerimaan_ckmentah_batch_penimbangan_draft')
                ->where('kiriman_id', $validated['kiriman_id'])
                ->update([
                    'berat_bruto'    => $validated['berat_bruto'],
                    'tara'           => $validated['tara'],
                    'berat_netto'    => $validated['berat_netto'],
                    'last_heartbeat' => now(),
                    'updated_at'     => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Draft berat live berhasil diperbarui.',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Gagal update draft penimbangan: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data live timbangan.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function print($id)
    {
        try {

            // ==========================================
            // 1. AMBIL DATA BATCH
            // ==========================================

            $batch = DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch'
            )
            ->where('id', $id)
            ->first();


            if (!$batch) {

                abort(
                    404,
                    'Data batch tidak ditemukan.'
                );
            }


            // ==========================================
            // 2. AMBIL SEMUA DATA TALLY
            // ==========================================

            $details = DB::table(
                'primary_prosesck_penerimaan_ckmentah_batch_penimbangan'
            )
            ->where(
                'kiriman_id',
                $id
            )
            ->orderBy(
                'nomor_karung'
            )
            ->get();


            // ==========================================
            // 3. HITUNG TOTAL
            // ==========================================

            $totalKarung = $details->count();

            $totalBruto = $details->sum(
                'berat_bruto'
            );

            $totalTara = $details->sum(
                'tara'
            );

            $totalNetto = $details->sum(
                'berat_netto'
            );


            // ==========================================
            // 4. TAMPILKAN HALAMAN PRINT
            // ==========================================

            return view(
                'prosesck.penerimaan.print',
                compact(
                    'batch',
                    'details',
                    'totalKarung',
                    'totalBruto',
                    'totalTara',
                    'totalNetto'
                )
            );

        } catch (\Exception $e) {

            Log::error(
                'Gagal mencetak batch: ' .
                $e->getMessage()
            );

            abort(
                500,
                'Gagal menampilkan laporan cetak.'
            );
        }
    }


}