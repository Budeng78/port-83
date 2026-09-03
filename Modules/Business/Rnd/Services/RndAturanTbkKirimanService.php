<?php

namespace Modules\Business\Rnd\Services;

use Illuminate\Support\Facades\DB;
use Modules\Business\Rnd\Models\RndAturanTbk;
use Modules\Business\Rnd\Models\RndAturanTbkDetail;
use Modules\Business\Rnd\Models\RndAturanTbkKiriman;
use Modules\Business\Rnd\Models\RndAturanTbkKirimanDetail;

class RndAturanTbkKirimanService
{
    /**
     * Ambil semua kiriman berdasarkan aturan.
     */
    public function getByAturan(string $aturanId)
    {
        return RndAturanTbkKiriman::query()
            ->with([
                'details.aturanDetail',
            ])
            ->where('aturan_id', $aturanId)
            ->latest()
            ->get();
    }

    /**
     * Ambil satu kiriman lengkap.
     */
    public function find(string $id): RndAturanTbkKiriman
    {
        return RndAturanTbkKiriman::query()
            ->with([
                'details.aturanDetail',
            ])
            ->findOrFail($id);
    }

    /**
     * Simpan kiriman beserta detail.
     */
    public function store(
        string $aturanId,
        array $data
    ): RndAturanTbkKiriman {
        return DB::transaction(function () use ($aturanId, $data) {

            // Pastikan aturan tersedia
            RndAturanTbk::query()
                ->findOrFail($aturanId);

            $this->validateDetailsBelongsToAturan(
                $aturanId,
                $data['details']
            );

            $kiriman = RndAturanTbkKiriman::create([
                'aturan_id'        => $aturanId,
                'no_surat_kiriman' => $data['no_surat_kiriman'],
                'nomor_kendaraan'  => $data['nomor_kendaraan'],
                'nama_sopir'       => $data['nama_sopir'],
                'dari'             => $data['dari'],
            ]);

            $this->createDetails(
                $kiriman,
                $data['details']
            );

            return $kiriman->load([
                'details.aturanDetail',
            ]);
        });
    }

    /**
     * Update kiriman beserta detail.
     */
    public function update(
        string $id,
        array $data
    ): RndAturanTbkKiriman {
        return DB::transaction(function () use ($id, $data) {

            $kiriman = RndAturanTbkKiriman::query()
                ->findOrFail($id);

            $this->validateDetailsBelongsToAturan(
                $kiriman->aturan_id,
                $data['details']
            );

            $kiriman->update([
                'no_surat_kiriman' => $data['no_surat_kiriman'],
                'nomor_kendaraan'  => $data['nomor_kendaraan'],
                'nama_sopir'       => $data['nama_sopir'],
                'dari'             => $data['dari'],
            ]);

            $kiriman->details()->delete();

            $this->createDetails(
                $kiriman,
                $data['details']
            );

            return $kiriman->load([
                'details.aturanDetail',
            ]);
        });
    }

    /**
     * Hapus kiriman secara soft delete.
     */
    public function delete(string $id): void
    {
        DB::transaction(function () use ($id) {

            $kiriman = RndAturanTbkKiriman::query()
                ->findOrFail($id);

            $kiriman->details()->delete();

            $kiriman->delete();
        });
    }

    /**
     * Ambil semua kiriman yang sudah di-soft-delete.
     */
    public function getTrash()
    {
        return RndAturanTbkKiriman::onlyTrashed()
            ->with([
                'aturan',
                'details' => function ($query) {
                    $query->withTrashed()
                        ->with('aturanDetail');
                },
            ])
            ->latest('deleted_at')
            ->get();
    }

    /**
     * Restore kiriman beserta detail.
     */
    public function restore(string $id): RndAturanTbkKiriman
    {
        return DB::transaction(function () use ($id) {

            $kiriman = RndAturanTbkKiriman::onlyTrashed()
                ->findOrFail($id);

            $kiriman->restore();

            $kiriman->details()
                ->withTrashed()
                ->restore();

            return $kiriman->load([
                'details.aturanDetail',
            ]);
        });
    }

    /**
     * Hapus permanen kiriman beserta detail.
     */
    public function forceDelete(string $id): void
    {
        DB::transaction(function () use ($id) {

            $kiriman = RndAturanTbkKiriman::withTrashed()
                ->findOrFail($id);

            $kiriman->details()
                ->withTrashed()
                ->forceDelete();

            $kiriman->forceDelete();
        });
    }

    /**
     * Validasi bahwa seluruh detail memang
     * berasal dari aturan yang sedang diproses.
     */
    protected function validateDetailsBelongsToAturan(
        string $aturanId,
        array $details
    ): void {
        $ids = collect($details)
            ->pluck('aturan_detail_id')
            ->unique()
            ->values();

        $count = RndAturanTbkDetail::query()
            ->where('aturan_id', $aturanId)
            ->whereIn('id', $ids)
            ->count();

        if ($count !== $ids->count()) {
            abort(422, 'Terdapat detail aturan yang tidak sesuai dengan aturan kiriman.');
        }
    }

    /**
     * Buat detail kiriman.
     */
    protected function createDetails(
        RndAturanTbkKiriman $kiriman,
        array $details
    ): void {
        foreach ($details as $detail) {
            RndAturanTbkKirimanDetail::create([
                'kiriman_id'       => $kiriman->id,
                'aturan_detail_id' => $detail['aturan_detail_id'],
                'type'             => $detail['type'],
                'jumlah_pack'      => $detail['jumlah_pack'],
                'tara'             => $detail['tara'],
            ]);
        }
    }
}