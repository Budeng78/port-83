<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class PenerimaanTimbangAwalRajangController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | TABLE
    |--------------------------------------------------------------------------
    */

    private const TABLE_HEADER =
        'primary_pos1_rajang_dokumen_timbang_awal';

    private const TABLE_DETAIL =
        'primary_pos1_rajang_dokumen_timbang_awal_detail';

    private const TABLE_CACHE =
        'primary_pos1_rajang_dokumen_timbang_awal_detail_cache';

    private const TABLE_WO =
        'primary_pos1_rajang_wo';


    /*
    |--------------------------------------------------------------------------
    | CREATE DOKUMEN
    |--------------------------------------------------------------------------
    |
    | POST /api/posrajang/timbang-awal
    |
    */

    public function store(Request $request): JsonResponse
    {
        try {

            $userId = auth()->id();

            /*
             * Validasi dasar.
             *
             * Kita sengaja tidak mengunci terlalu banyak field
             * agar kompatibel dengan payload frontend yang sekarang.
             */

            $validated = $request->validate([
                'wo_id' => ['nullable', 'string'],
                'id_wo' => ['nullable', 'string'],
                'no_wo' => ['nullable', 'string', 'max:100'],
                'tanggal' => ['nullable', 'date'],
                'tanggal_timbang' => ['nullable', 'date'],
            ]);

            /*
             * ----------------------------------------------------------
             * CARI DOKUMEN AKTIF
             * ----------------------------------------------------------
             *
             * Satu user tidak boleh membuat dokumen aktif kedua
             * apabila masih mempunyai dokumen draft.
             */

            $existing = DB::table(self::TABLE_HEADER)
                ->where('created_by', $userId)
                ->whereIn('status', [
                    'draft',
                    'open',
                    'aktif',
                ])
                ->orderByDesc('created_at')
                ->first();

            if ($existing) {

                return response()->json([
                    'success' => true,
                    'message' => 'Dokumen timbang awal yang masih aktif ditemukan.',
                    'data' => $this->loadDocument($existing->id),
                    'recovered' => true,
                ]);
            }


            /*
             * ----------------------------------------------------------
             * ID DOKUMEN
             * ----------------------------------------------------------
             */

            $id = (string) Str::uuid();

            /*
             * ----------------------------------------------------------
             * DATA HEADER
             * ----------------------------------------------------------
             */

            $data = [
                'id' => $id,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ];


            /*
             * Masukkan field hanya apabila kolomnya memang ada.
             *
             * Ini membuat controller lebih aman terhadap sedikit
             * perbedaan schema antara migration lama dan baru.
             */

            $columns = $this->tableColumns(self::TABLE_HEADER);

            $this->putIfColumn(
                $data,
                $columns,
                'wo_id',
                $request->input('wo_id')
                    ?? $request->input('id_wo')
            );

            $this->putIfColumn(
                $data,
                $columns,
                'id_wo',
                $request->input('id_wo')
                    ?? $request->input('wo_id')
            );

            $this->putIfColumn(
                $data,
                $columns,
                'no_wo',
                $request->input('no_wo')
            );

            $this->putIfColumn(
                $data,
                $columns,
                'tanggal',
                $request->input('tanggal')
                    ?? $request->input('tanggal_timbang')
            );

            $this->putIfColumn(
                $data,
                $columns,
                'tanggal_timbang',
                $request->input('tanggal_timbang')
                    ?? $request->input('tanggal')
            );

            $this->putIfColumn(
                $data,
                $columns,
                'status',
                'draft'
            );


            DB::transaction(function () use ($data) {

                DB::table(self::TABLE_HEADER)
                    ->insert($data);

            });


            $document = $this->loadDocument($id);


            return response()->json([
                'success' => true,
                'message' => 'Dokumen timbang awal berhasil dibuat.',
                'data' => $document,
                'recovered' => false,
            ], 201);


        } catch (Throwable $e) {

            Log::error(
                'Gagal membuat dokumen timbang awal Rajang.',
                [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'user_id' => auth()->id(),
                    'payload' => $request->except([
                        'password',
                        'token',
                    ]),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat dokumen timbang awal.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | RECOVERY
    |--------------------------------------------------------------------------
    |
    | POST /api/posrajang/timbang-awal/recovery
    |
    */

    public function recovery(Request $request): JsonResponse
    {
        try {

            $userId = auth()->id();

            $document = DB::table(self::TABLE_HEADER)
                ->where('created_by', $userId)
                ->whereIn('status', [
                    'draft',
                    'open',
                    'aktif',
                ])
                ->orderByDesc('created_at')
                ->first();

            if (!$document) {

                return response()->json([
                    'success' => true,
                    'found' => false,
                    'message' => 'Tidak ada dokumen timbang awal aktif.',
                    'data' => null,
                ]);
            }


            return response()->json([
                'success' => true,
                'found' => true,
                'message' => 'Dokumen timbang awal berhasil ditemukan.',
                'data' => $this->loadDocument($document->id),
            ]);


        } catch (Throwable $e) {

            Log::error(
                'Gagal recovery dokumen timbang awal Rajang.',
                [
                    'message' => $e->getMessage(),
                    'user_id' => auth()->id(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan recovery dokumen.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    |
    | GET /api/posrajang/timbang-awal/{id}
    |
    */

    public function show(string $id): JsonResponse
    {
        try {

            $document = $this->loadDocument($id);

            if (!$document) {

                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen timbang awal tidak ditemukan.',
                ], 404);
            }


            return response()->json([
                'success' => true,
                'data' => $document,
            ]);


        } catch (Throwable $e) {

            Log::error(
                'Gagal mengambil dokumen timbang awal Rajang.',
                [
                    'id' => $id,
                    'message' => $e->getMessage(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil dokumen.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | SIMPAN TALLY
    |--------------------------------------------------------------------------
    |
    | POST /api/posrajang/timbang-awal/{id}/tally
    |
    */

    public function storeTally(
        Request $request,
        string $id
    ): JsonResponse {

        try {

            $userId = auth()->id();

            $request->validate([
                'nomor_tally' => ['required', 'integer', 'min:1'],
                'berat' => ['required', 'numeric', 'min:0'],
            ]);


            $header = DB::table(self::TABLE_HEADER)
                ->where('id', $id)
                ->first();

            if (!$header) {

                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen timbang tidak ditemukan.',
                ], 404);
            }


            if (
                isset($header->status)
                &&
                !in_array(
                    $header->status,
                    ['draft', 'open', 'aktif'],
                    true
                )
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen sudah tidak dapat diubah.',
                ], 422);
            }


            $nomorTally = (int) $request->input('nomor_tally');
            $berat = $request->input('berat');


            /*
             * Cegah duplicate tally.
             */

            $exists = DB::table(self::TABLE_DETAIL)
                ->where('dokumen_id', $id)
                ->where('nomor_tally', $nomorTally)
                ->exists();

            if ($exists) {

                return response()->json([
                    'success' => false,
                    'message' => "Tally nomor {$nomorTally} sudah ada.",
                ], 422);
            }


            $columns = $this->tableColumns(self::TABLE_DETAIL);

            $detail = [
                'id' => (string) Str::uuid(),
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ];


            $this->putIfColumn(
                $detail,
                $columns,
                'dokumen_id',
                $id
            );

            $this->putIfColumn(
                $detail,
                $columns,
                'timbang_awal_id',
                $id
            );

            $this->putIfColumn(
                $detail,
                $columns,
                'document_id',
                $id
            );

            $this->putIfColumn(
                $detail,
                $columns,
                'nomor_tally',
                $nomorTally
            );

            $this->putIfColumn(
                $detail,
                $columns,
                'berat',
                $berat
            );

            $this->putIfColumn(
                $detail,
                $columns,
                'berat_kg',
                $berat
            );


            DB::transaction(function () use (
                $detail,
                $id,
                $nomorTally
            ) {

                DB::table(self::TABLE_DETAIL)
                    ->insert($detail);


                /*
                 * Cache jika tabel tersedia.
                 */

                if ($this->tableExists(self::TABLE_CACHE)) {

                    $cacheColumns =
                        $this->tableColumns(self::TABLE_CACHE);

                    $cache = [
                        'id' => (string) Str::uuid(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    $this->putIfColumn(
                        $cache,
                        $cacheColumns,
                        'dokumen_id',
                        $id
                    );

                    $this->putIfColumn(
                        $cache,
                        $cacheColumns,
                        'timbang_awal_id',
                        $id
                    );

                    $this->putIfColumn(
                        $cache,
                        $cacheColumns,
                        'document_id',
                        $id
                    );

                    $this->putIfColumn(
                        $cache,
                        $cacheColumns,
                        'nomor_tally',
                        $nomorTally
                    );

                    $this->putIfColumn(
                        $cache,
                        $cacheColumns,
                        'berat',
                        $detail['berat']
                            ?? $detail['berat_kg']
                            ?? 0
                    );

                    DB::table(self::TABLE_CACHE)
                        ->insert($cache);
                }
            });


            return response()->json([
                'success' => true,
                'message' => "Tally nomor {$nomorTally} berhasil disimpan.",
                'data' => $this->loadDocument($id),
            ], 201);


        } catch (Throwable $e) {

            Log::error(
                'Gagal menyimpan tally timbang awal Rajang.',
                [
                    'id' => $id,
                    'message' => $e->getMessage(),
                    'user_id' => auth()->id(),
                    'payload' => $request->all(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan tally.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE TALLY
    |--------------------------------------------------------------------------
    |
    | DELETE /api/posrajang/timbang-awal/{id}/tally/{nomorTally}
    |
    |--------------------------------------------------------------------------
    |
    | ATURAN:
    |
    | 1,2,3,4,5
    |
    | hapus 3
    |
    | menjadi
    |
    | 1,2,3,4
    |
    */

    public function deleteTally(
        Request $request,
        string $id,
        int $nomorTally
    ): JsonResponse {

        try {

            $userId = auth()->id();

            DB::transaction(function () use (
                $id,
                $nomorTally,
                $userId
            ) {

                $detail = DB::table(self::TABLE_DETAIL)
                    ->where('dokumen_id', $id)
                    ->where('nomor_tally', $nomorTally)
                    ->first();

                if (!$detail) {

                    abort(
                        404,
                        "Tally nomor {$nomorTally} tidak ditemukan."
                    );
                }


                /*
                 * Hapus detail.
                 */

                DB::table(self::TABLE_DETAIL)
                    ->where('dokumen_id', $id)
                    ->where('nomor_tally', $nomorTally)
                    ->delete();


                /*
                 * Hapus cache dengan nomor yang sama.
                 */

                if ($this->tableExists(self::TABLE_CACHE)) {

                    DB::table(self::TABLE_CACHE)
                        ->where('dokumen_id', $id)
                        ->where('nomor_tally', $nomorTally)
                        ->delete();
                }


                /*
                 * ------------------------------------------------------
                 * RAPATKAN NOMOR TALLY
                 * ------------------------------------------------------
                 *
                 * 1 2 3 4 5
                 *     X
                 *
                 * menjadi:
                 *
                 * 1 2 3 4
                 */

                $rows = DB::table(self::TABLE_DETAIL)
                    ->where('dokumen_id', $id)
                    ->orderBy('nomor_tally')
                    ->get();


                $nomorBaru = 1;

                foreach ($rows as $row) {

                    if ((int) $row->nomor_tally !== $nomorBaru) {

                        DB::table(self::TABLE_DETAIL)
                            ->where('id', $row->id)
                            ->update([
                                'nomor_tally' => $nomorBaru,
                                'updated_by' => $userId,
                                'updated_at' => now(),
                            ]);
                    }

                    $nomorBaru++;
                }


                /*
                 * Rapatkan cache.
                 *
                 * Karena UNIQUE index:
                 *
                 * dokumen_id + nomor_tally
                 *
                 * kita gunakan temporary nomor negatif terlebih dahulu
                 * supaya tidak terjadi:
                 *
                 * Duplicate entry ...
                 */

                if ($this->tableExists(self::TABLE_CACHE)) {

                    $cacheRows = DB::table(self::TABLE_CACHE)
                        ->where('dokumen_id', $id)
                        ->orderBy('nomor_tally')
                        ->get();

                    foreach ($cacheRows as $index => $row) {

                        DB::table(self::TABLE_CACHE)
                            ->where('id', $row->id)
                            ->update([
                                'nomor_tally' => -($index + 1),
                                'updated_by' => $userId,
                                'updated_at' => now(),
                            ]);
                    }

                    foreach ($cacheRows as $index => $row) {

                        DB::table(self::TABLE_CACHE)
                            ->where('id', $row->id)
                            ->update([
                                'nomor_tally' => $index + 1,
                                'updated_by' => $userId,
                                'updated_at' => now(),
                            ]);
                    }
                }
            });


            return response()->json([
                'success' => true,
                'message' => "Tally nomor {$nomorTally} berhasil dihapus dan nomor tally dirapatkan.",
                'data' => $this->loadDocument($id),
            ]);


        } catch (Throwable $e) {

            Log::error(
                'Gagal menghapus tally timbang awal Rajang.',
                [
                    'id' => $id,
                    'nomor_tally' => $nomorTally,
                    'message' => $e->getMessage(),
                    'user_id' => auth()->id(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus tally.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE DRAFT
    |--------------------------------------------------------------------------
    |
    | PUT /api/posrajang/timbang-awal/{id}/draft
    |
    */

    public function updateDraft(
        Request $request,
        string $id
    ): JsonResponse {

        try {

            $header = DB::table(self::TABLE_HEADER)
                ->where('id', $id)
                ->first();

            if (!$header) {

                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen tidak ditemukan.',
                ], 404);
            }


            $columns = $this->tableColumns(self::TABLE_HEADER);

            $data = [
                'updated_at' => now(),
            ];


            /*
             * Update field yang dikirim frontend
             * dan memang tersedia di database.
             */

            foreach (
                [
                    'wo_id',
                    'id_wo',
                    'no_wo',
                    'tanggal',
                    'tanggal_timbang',
                    'status',
                    'keterangan',
                ] as $field
            ) {

                if (
                    $request->has($field)
                    &&
                    in_array($field, $columns, true)
                ) {

                    $data[$field] = $request->input($field);
                }
            }


            if (in_array('updated_by', $columns, true)) {
                $data['updated_by'] = auth()->id();
            }


            DB::table(self::TABLE_HEADER)
                ->where('id', $id)
                ->update($data);


            return response()->json([
                'success' => true,
                'message' => 'Dokumen draft berhasil diperbarui.',
                'data' => $this->loadDocument($id),
            ]);


        } catch (Throwable $e) {

            Log::error(
                'Gagal update draft timbang awal Rajang.',
                [
                    'id' => $id,
                    'message' => $e->getMessage(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui draft.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | FINISH
    |--------------------------------------------------------------------------
    |
    | POST /api/posrajang/timbang-awal/{id}/finish
    |
    */

    public function finish(string $id): JsonResponse
    {
        try {

            $header = DB::table(self::TABLE_HEADER)
                ->where('id', $id)
                ->first();

            if (!$header) {

                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen tidak ditemukan.',
                ], 404);
            }


            $totalTally = DB::table(self::TABLE_DETAIL)
                ->where('dokumen_id', $id)
                ->count();


            if ($totalTally < 1) {

                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen belum memiliki tally.',
                ], 422);
            }


            $columns = $this->tableColumns(self::TABLE_HEADER);

            $data = [
                'updated_at' => now(),
            ];


            if (in_array('status', $columns, true)) {
                $data['status'] = 'finished';
            }

            if (in_array('updated_by', $columns, true)) {
                $data['updated_by'] = auth()->id();
            }


            DB::transaction(function () use (
                $id,
                $data
            ) {

                DB::table(self::TABLE_HEADER)
                    ->where('id', $id)
                    ->update($data);
            });


            return response()->json([
                'success' => true,
                'message' => 'Dokumen timbang awal berhasil diselesaikan.',
                'data' => $this->loadDocument($id),
            ]);


        } catch (Throwable $e) {

            Log::error(
                'Gagal finish timbang awal Rajang.',
                [
                    'id' => $id,
                    'message' => $e->getMessage(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyelesaikan dokumen.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | PRINT
    |--------------------------------------------------------------------------
    |
    | GET /api/posrajang/timbang-awal/{id}/print
    |
    */

    public function print(string $id)
    {
        try {

            $document = $this->loadDocument($id);

            if (!$document) {

                return response()->json([
                    'success' => false,
                    'message' => 'Dokumen tidak ditemukan.',
                ], 404);
            }


            return response()->json([
                'success' => true,
                'data' => $document,
            ]);


        } catch (Throwable $e) {

            Log::error(
                'Gagal print timbang awal Rajang.',
                [
                    'id' => $id,
                    'message' => $e->getMessage(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data print.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | LOAD DOCUMENT
    |--------------------------------------------------------------------------
    */

    private function loadDocument(string $id): ?object
    {
        $header = DB::table(self::TABLE_HEADER)
            ->where('id', $id)
            ->first();

        if (!$header) {
            return null;
        }


        $details = DB::table(self::TABLE_DETAIL)
            ->where('dokumen_id', $id)
            ->orderBy('nomor_tally')
            ->get();


        /*
         * Normalisasi nomor tally.
         */

        $details = $details
            ->values()
            ->map(function ($row, $index) {

                $row->nomor_tally =
                    $index + 1;

                return $row;
            });


        $header->details = $details;

        $header->total_tally =
            $details->count();

        $header->total_berat =
            $details->sum(function ($row) {

                return (float) (
                    $row->berat
                    ?? $row->berat_kg
                    ?? 0
                );
            });


        return $header;
    }


    /*
    |--------------------------------------------------------------------------
    | DATABASE HELPERS
    |--------------------------------------------------------------------------
    */

    private function tableExists(string $table): bool
    {
        try {

            return DB::getSchemaBuilder()
                ->hasTable($table);

        } catch (Throwable) {

            return false;
        }
    }


    private function tableColumns(string $table): array
    {
        if (!$this->tableExists($table)) {
            return [];
        }

        return DB::getSchemaBuilder()
            ->getColumnListing($table);
    }


    private function putIfColumn(
        array &$data,
        array $columns,
        string $column,
        mixed $value
    ): void {

        if (
            in_array($column, $columns, true)
            &&
            $value !== null
        ) {

            $data[$column] = $value;
        }
    }
}