<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Business\Produksi\Primary\PosRajang\Models\PrimaryPos1RajangDokumenTimbangAwal;
use Modules\Business\Produksi\Primary\PosRajang\Models\PrimaryPos1RajangDokumenTimbangAwalDetail;
use Modules\Business\Produksi\Primary\PosRajang\Models\PrimaryPos1RajangDokumenTimbangAwalDetailCache;

class PrimaryPos1RajangTimbangAwalService
{
    /**
     * =========================================================================
     * CREATE HEADER
     * =========================================================================
     *
     * Membuat dokumen/header timbang awal.
     *
     * Nomor dokumen dibuat otomatis oleh sistem.
     *
     * Contoh:
     *
     * data terakhir:
     * no = 3
     *
     * maka:
     * no berikutnya = 4
     */
    public function createHeader(
        array $data
    ): PrimaryPos1RajangDokumenTimbangAwal {

        return DB::transaction(function () use ($data) {

            /*
             * Ambil nomor dokumen terakhir.
             *
             * lockForUpdate() digunakan agar proses pembuatan
             * nomor tidak bertabrakan ketika ada transaksi bersamaan.
             */
            $lastNo = PrimaryPos1RajangDokumenTimbangAwal::query()
                ->lockForUpdate()
                ->max('no');

            $nextNo = ((int) $lastNo) + 1;

            return PrimaryPos1RajangDokumenTimbangAwal::create([
                'no'         => $nextNo,
                'no_wo'      => $data['no_wo'],
                'jenis'      => $data['jenis'],
                's_k'        => $data['s_k'],
                'tara'       => $data['tara'],
                'jumlah_bal' => $data['jumlah_bal'],
                'status'     => $data['status'] ?? 'draft',
            ]);
        });
    }


    /**
     * =========================================================================
     * GET TIMBANG AKTIF / RECOVERY
     * =========================================================================
     *
     * Mengambil header beserta seluruh CACHE tally.
     *
     * Digunakan ketika:
     *
     * - browser reload
     * - listrik mati
     * - koneksi terputus
     * - operator melakukan recovery
     */
    public function getTimbangAktif(
        string $dokumenTimbangAwalId
    ): PrimaryPos1RajangDokumenTimbangAwal {

        return PrimaryPos1RajangDokumenTimbangAwal::query()
            ->with([
                'detailCaches' => function ($query) {
                    $query->orderBy('nomor_tally');
                },
            ])
            ->findOrFail($dokumenTimbangAwalId);
    }


    /**
     * =========================================================================
     * SIMPAN TALLY KE CACHE
     * =========================================================================
     *
     * 1 tally = 1 bal = 1 hasil timbang.
     *
     * MQTT mengirim BERAT BRUTO.
     *
     * Netto:
     *
     * bruto - tara
     *
     * Contoh:
     *
     * bruto = 48.50
     * tara  = 4.50
     *
     * netto = 44.00
     */
    public function simpanCache(
        string $dokumenTimbangAwalId,
        int $nomorTally,
        float $beratBruto,
        ?float $tara = null
    ): PrimaryPos1RajangDokumenTimbangAwalDetailCache {

        return DB::transaction(function () use (
            $dokumenTimbangAwalId,
            $nomorTally,
            $beratBruto,
            $tara
        ) {

            /*
             * Lock header.
             */
            $header = PrimaryPos1RajangDokumenTimbangAwal::query()
                ->lockForUpdate()
                ->findOrFail($dokumenTimbangAwalId);


            /*
             * Dokumen completed tidak boleh menerima
             * hasil timbang baru.
             */
            if ($header->status === 'completed') {

                throw ValidationException::withMessages([
                    'status' =>
                        'Dokumen timbang sudah selesai.',
                ]);
            }


            /*
             * Pastikan nomor tally valid.
             */
            if ($nomorTally < 1) {

                throw ValidationException::withMessages([
                    'nomor_tally' =>
                        'Nomor tally harus dimulai dari 1.',
                ]);
            }


            /*
             * Jangan melebihi jumlah bal yang direncanakan.
             */
            if (
                $nomorTally >
                (int) $header->jumlah_bal
            ) {

                throw ValidationException::withMessages([
                    'nomor_tally' =>
                        "Nomor tally {$nomorTally} " .
                        "melebihi jumlah bal " .
                        "{$header->jumlah_bal}.",
                ]);
            }


            /*
             * Tara.
             *
             * Jika tara tidak dikirim dari frontend,
             * gunakan tara dari header.
             */
            $beratTara = $tara !== null
                ? $tara
                : (float) $header->tara;


            /*
             * Hitung netto.
             */
            $beratNetto = max(
                0,
                $beratBruto - $beratTara
            );


            /*
             * Cegah duplicate tally.
             *
             * Misalnya MQTT mengirim data dua kali
             * untuk tally yang sama.
             */
            $existing =
                PrimaryPos1RajangDokumenTimbangAwalDetailCache::query()
                    ->where(
                        'dokumen_timbang_awal_id',
                        $header->id
                    )
                    ->where(
                        'nomor_tally',
                        $nomorTally
                    )
                    ->first();

            if ($existing) {
                return $existing;
            }


            /*
             * Simpan hasil timbang ke CACHE.
             */
            $cache =
                PrimaryPos1RajangDokumenTimbangAwalDetailCache::create([
                    'dokumen_timbang_awal_id' =>
                        $header->id,

                    'nomor_tally' =>
                        $nomorTally,

                    'berat_bruto' =>
                        $beratBruto,

                    'tara' =>
                        $beratTara,

                    'berat_netto' =>
                        $beratNetto,

                    'waktu_timbang' =>
                        now(),
                ]);


            /*
             * Draft berubah menjadi in_progress
             * ketika tally pertama berhasil masuk.
             */
            if ($header->status === 'draft') {

                $header->status = 'in_progress';

                $header->save();
            }


            return $cache;
        });
    }


    /**
     * =========================================================================
     * NEXT TALLY
     * =========================================================================
     *
     * Mengambil nomor tally berikutnya.
     *
     * Contoh:
     *
     * CACHE:
     * 1
     * 2
     * 3
     *
     * hasil:
     * 4
     *
     * Jika tally 3 dihapus dan menjadi:
     *
     * 1
     * 2
     *
     * maka:
     *
     * next = 3
     */
    public function getNextTallyNumber(
        string $dokumenTimbangAwalId
    ): int {

        $lastNumber =
            PrimaryPos1RajangDokumenTimbangAwalDetailCache::query()
                ->where(
                    'dokumen_timbang_awal_id',
                    $dokumenTimbangAwalId
                )
                ->max('nomor_tally');

        return ((int) $lastNumber) + 1;
    }


    /**
     * =========================================================================
     * HAPUS TALLY DARI CACHE
     * =========================================================================
     *
     * Ini adalah fungsi X pada lembar tally.
     *
     * Contoh:
     *
     * sebelum:
     *
     * 1
     * 2
     * 3  <-- hapus
     * 4
     * 5
     *
     * sesudah:
     *
     * 1
     * 2
     * 3
     * 4
     *
     * Data tally nomor 3 lama benar-benar dihapus dari CACHE.
     *
     * Tally nomor 4 dan 5 kemudian dirapatkan.
     */
    public function hapusTally(
        string $dokumenTimbangAwalId,
        int $nomorTally
    ): void {

        DB::transaction(function () use (
            $dokumenTimbangAwalId,
            $nomorTally
        ) {

            /*
             * Lock header.
             */
            $header =
                PrimaryPos1RajangDokumenTimbangAwal::query()
                    ->lockForUpdate()
                    ->findOrFail($dokumenTimbangAwalId);


            /*
             * Dokumen completed tidak boleh diubah.
             */
            if ($header->status === 'completed') {

                throw ValidationException::withMessages([
                    'status' =>
                        'Dokumen timbang sudah selesai dan tidak dapat diubah.',
                ]);
            }


            /*
             * Validasi nomor.
             */
            if ($nomorTally < 1) {

                throw ValidationException::withMessages([
                    'nomor_tally' =>
                        'Nomor tally tidak valid.',
                ]);
            }


            /*
             * Cari tally.
             */
            $cache =
                PrimaryPos1RajangDokumenTimbangAwalDetailCache::query()
                    ->where(
                        'dokumen_timbang_awal_id',
                        $header->id
                    )
                    ->where(
                        'nomor_tally',
                        $nomorTally
                    )
                    ->first();


            /*
             * Tally tidak ditemukan.
             */
            if (!$cache) {

                throw ValidationException::withMessages([
                    'nomor_tally' =>
                        "Tally nomor {$nomorTally} tidak ditemukan.",
                ]);
            }


            /*
             * Hapus tally.
             *
             * Karena CACHE menggunakan SoftDeletes,
             * delete() akan mengisi deleted_at.
             */
            $cache->delete();


            /*
             * Ambil CACHE yang masih aktif.
             */
            $remaining =
                PrimaryPos1RajangDokumenTimbangAwalDetailCache::query()
                    ->where(
                        'dokumen_timbang_awal_id',
                        $header->id
                    )
                    ->orderBy('nomor_tally')
                    ->get();


            /*
             * Rapikan nomor tally.
             *
             * Hasil akhirnya selalu:
             *
             * 1,2,3,4,5,...
             */
            foreach (
                $remaining->values()
                as $index => $item
            ) {

                $nomorBaru = $index + 1;

                if (
                    (int) $item->nomor_tally
                    !== $nomorBaru
                ) {

                    $item->nomor_tally =
                        $nomorBaru;

                    $item->save();
                }
            }
        });
    }


    /**
     * Menghapus satu tally dari CACHE.
     *
     * Aturan:
     *
     * 1, 2, 3, 4, 5
     *
     * hapus 3
     *
     * menjadi:
     *
     * 1, 2, 3, 4
     *
     * Nomor tally setelah nomor yang dihapus
     * otomatis digeser ke atas.
     *
     * Hanya CACHE yang boleh dihapus.
     * DETAIL yang sudah final tidak boleh dihapus
     * melalui endpoint ini.
     */
    public function hapusCacheTally(
        string $dokumenTimbangAwalId,
        int $nomorTally
    ): void {

        DB::transaction(function () use (
            $dokumenTimbangAwalId,
            $nomorTally
        ) {

            $header = PrimaryPos1RajangDokumenTimbangAwal::query()
                ->lockForUpdate()
                ->findOrFail($dokumenTimbangAwalId);

            /*
            * Dokumen completed tidak boleh diubah.
            */
            if ($header->status === 'completed') {
                throw ValidationException::withMessages([
                    'status' =>
                        'Dokumen timbang sudah selesai dan tidak dapat diubah.',
                ]);
            }

            /*
            * Cari tally yang akan dihapus.
            */
            $tally = PrimaryPos1RajangDokumenTimbangAwalDetailCache::query()
                ->where(
                    'dokumen_timbang_awal_id',
                    $header->id
                )
                ->where(
                    'nomor_tally',
                    $nomorTally
                )
                ->lockForUpdate()
                ->first();

            if (!$tally) {
                throw ValidationException::withMessages([
                    'nomor_tally' =>
                        "Tally nomor {$nomorTally} tidak ditemukan.",
                ]);
            }

            /*
            * Hapus tally.
            */
            $tally->delete();

            /*
            * Geser semua nomor setelah tally
            * yang dihapus.
            *
            * Contoh:
            *
            * 1 2 3 4 5
            *     X
            *
            * menjadi:
            *
            * 1 2 3 4
            */
            PrimaryPos1RajangDokumenTimbangAwalDetailCache::query()
                ->where(
                    'dokumen_timbang_awal_id',
                    $header->id
                )
                ->where(
                    'nomor_tally',
                    '>',
                    $nomorTally
                )
                ->orderBy('nomor_tally')
                ->get()
                ->each(function (
                    PrimaryPos1RajangDokumenTimbangAwalDetailCache $item
                ) {

                    $item->nomor_tally =
                        $item->nomor_tally - 1;

                    $item->save();
                });
        });
    }



    /**
     * =========================================================================
     * SELESAI TIMBANG
     * =========================================================================
     *
     * Alur:
     *
     * CACHE
     *   ↓
     * DETAIL
     *   ↓
     * HEADER = completed
     *   ↓
     * CACHE = soft delete
     */
    public function selesaiTimbang(
        string $dokumenTimbangAwalId
    ): PrimaryPos1RajangDokumenTimbangAwal {

        return DB::transaction(function () use (
            $dokumenTimbangAwalId
        ) {

            /*
             * Lock header.
             */
            $header =
                PrimaryPos1RajangDokumenTimbangAwal::query()
                    ->lockForUpdate()
                    ->findOrFail($dokumenTimbangAwalId);


            /*
             * Jika sudah selesai,
             * jangan proses dua kali.
             */
            if ($header->status === 'completed') {

                return $header;
            }


            /*
             * Ambil seluruh CACHE aktif.
             */
            $caches =
                PrimaryPos1RajangDokumenTimbangAwalDetailCache::query()
                    ->where(
                        'dokumen_timbang_awal_id',
                        $header->id
                    )
                    ->orderBy('nomor_tally')
                    ->get();


            /*
             * Jumlah tally harus sama dengan jumlah bal.
             */
            if (
                $caches->count()
                !== (int) $header->jumlah_bal
            ) {

                throw ValidationException::withMessages([
                    'jumlah_bal' =>
                        "Jumlah tally belum lengkap. " .
                        "Rencana {$header->jumlah_bal} bal, " .
                        "baru {$caches->count()} bal yang ditimbang.",
                ]);
            }


            /*
             * Pastikan nomor tally rapat:
             *
             * 1,2,3,4,5,...
             */
            foreach (
                $caches->values()
                as $index => $cache
            ) {

                $nomorSeharusnya =
                    $index + 1;

                if (
                    (int) $cache->nomor_tally
                    !== $nomorSeharusnya
                ) {

                    throw ValidationException::withMessages([
                        'nomor_tally' =>
                            "Nomor tally tidak berurutan. " .
                            "Seharusnya {$nomorSeharusnya}, " .
                            "ditemukan {$cache->nomor_tally}.",
                    ]);
                }
            }


            /*
             * Salin CACHE → DETAIL.
             */
            foreach ($caches as $cache) {

                PrimaryPos1RajangDokumenTimbangAwalDetail::create([
                    'dokumen_timbang_awal_id' =>
                        $header->id,

                    'nomor_tally' =>
                        $cache->nomor_tally,

                    'berat_bruto' =>
                        $cache->berat_bruto,

                    'tara' =>
                        $cache->tara,

                    'berat_netto' =>
                        $cache->berat_netto,

                    'waktu_timbang' =>
                        $cache->waktu_timbang,
                ]);
            }


            /*
             * Tandai header selesai.
             */
            $header->status = 'completed';

            $header->save();


            /*
             * CACHE di-soft-delete.
             *
             * Tidak dihapus fisik.
             */
            PrimaryPos1RajangDokumenTimbangAwalDetailCache::query()
                ->where(
                    'dokumen_timbang_awal_id',
                    $header->id
                )
                ->delete();


            /*
             * Kembalikan header beserta DETAIL.
             */
            return $header->load('details');
        });
    }
}