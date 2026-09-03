<?php

namespace Modules\Business\Rnd\Services;

use Illuminate\Support\Facades\DB;
use Modules\Business\Rnd\Models\RndTobaccoAturan;

class RndTobaccoAturanService
{
    /**
     * Mengambil seluruh aturan beserta detailnya.
     */
    public function getAll(
        ?string $search = null,
        int $perPage = 20
    ) {
        return RndTobaccoAturan::with('details')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('kode_aturan', 'like', "%{$search}%")
                        ->orWhereDate('tanggal_aturan', $search);
                });
            })
            ->latest('tanggal_aturan')
            ->paginate($perPage);
    }

    /**
     * Mengambil satu aturan beserta detailnya.
     */
    public function getById(string $id): RndTobaccoAturan
    {
        return RndTobaccoAturan::with('details')
            ->findOrFail($id);
    }

    /**
     * Membuat aturan baru beserta seluruh detailnya.
     */
    public function create(array $data): RndTobaccoAturan
    {
        return DB::transaction(function () use ($data) {

            $aturan = RndTobaccoAturan::create([
                'kode_aturan'    => $data['kode_aturan'],
                'tanggal_aturan' => $data['tanggal_aturan'],
            ]);

            $this->syncDetails(
                $aturan,
                $data['details'] ?? []
            );

            return $aturan->load('details');
        });
    }

    /**
     * Mengubah aturan beserta detailnya.
     */


    public function update(
        string $id,
        array $data
    ): RndTobaccoAturan {
        return DB::transaction(function () use ($id, $data) {

            $aturan = RndTobaccoAturan::findOrFail($id);

            /*
            * =========================================================
            * 1. Update header
            * =========================================================
            */
            $aturan->update([
                'kode_aturan'    => $data['kode_aturan'],
                'tanggal_aturan' => $data['tanggal_aturan'],
            ]);

            $details = $data['details'] ?? [];

            /*
            * =========================================================
            * 2. Ambil ID detail yang masih dikirim frontend
            * =========================================================
            */
            $existingDetailIds = collect($details)
                ->pluck('id')
                ->filter()
                ->values()
                ->all();

            /*
            * =========================================================
            * 3. Detail yang tidak lagi dikirim → soft delete
            * =========================================================
            */
            $aturan->details()
                ->whereNotIn('id', $existingDetailIds)
                ->delete();

            /*
            * =========================================================
            * 4. Update detail lama / buat detail baru
            * =========================================================
            */
            foreach ($details as $detail) {

                /*
                * -----------------------------------------------------
                * Detail lama
                * -----------------------------------------------------
                */
                if (!empty($detail['id'])) {

                    $detailModel = $aturan->details()
                        ->where('id', $detail['id'])
                        ->firstOrFail();

                    $detailModel->update([
                        'type'            => $detail['type'],
                        'gdg'             => $detail['gdg'] ?? null,
                        'jenis_tembakau' => $detail['jenis_tembakau'],
                        'tahun'           => $detail['tahun'],
                        's_k'             => $detail['s_k'] ?? null,
                        'grade'           => $detail['grade'] ?? null,
                        'rencana'         => $detail['rencana'],
                    ]);

                    continue;
                }

                /*
                * -----------------------------------------------------
                * Detail baru
                * -----------------------------------------------------
                *
                * Ambil nomor terakhir kemudian +1.
                */
                $lastNo = $aturan->details()
                    ->max('no');

                $aturan->details()->create([
                    'type'            => $detail['type'],
                    'no'              => ($lastNo ?? 0) + 1,
                    'gdg'             => $detail['gdg'] ?? null,
                    'jenis_tembakau' => $detail['jenis_tembakau'],
                    'tahun'           => $detail['tahun'],
                    's_k'             => $detail['s_k'] ?? null,
                    'grade'           => $detail['grade'] ?? null,
                    'rencana'         => $detail['rencana'],
                ]);
            }

            /*
            * =========================================================
            * 5. Ambil data terbaru
            * =========================================================
            */
            return $aturan->fresh('details');
        });
    }




    /**
     * Menghapus aturan beserta detailnya.
     *
     * Karena BaseModel menggunakan SoftDeletes,
     * delete() tidak menghapus record secara permanen.
     */
    public function delete(string $id): void
    {
        DB::transaction(function () use ($id) {

            $aturan = RndTobaccoAturan::findOrFail($id);

            /*
             * Detail ikut di-soft-delete.
             */
            $aturan->details()->delete();

            /*
             * Header di-soft-delete.
             */
            $aturan->delete();
        });
    }

    /**
     * Menyimpan detail aturan sekaligus menentukan nomor detail.
     */
    protected function syncDetails(
        RndTobaccoAturan $aturan,
        array $details
    ): void {
        foreach ($details as $index => $detail) {
            $aturan->details()->create([
                'type'            => $detail['type'],
                'no'              => $index + 1,
                'gdg'             => $detail['gdg'] ?? null,
                'jenis_tembakau' => $detail['jenis_tembakau'],
                'tahun'           => $detail['tahun'],
                's_k'             => $detail['s_k'] ?? null,
                'grade'           => $detail['grade'] ?? null,
                'rencana'         => $detail['rencana'],
            ]);
        }
    }

       /**
     * Mengambil aturan yang berada di trash.
     */
    public function getTrash()
    {
        return RndTobaccoAturan::onlyTrashed()
            ->with([
                'details' => function ($query) {
                    $query->withTrashed();
                },
            ])
            ->latest('deleted_at')
            ->get();
    }

    /**
     * Mengembalikan aturan dari trash.
     */
    public function restore(string $id): RndTobaccoAturan
    {
        return DB::transaction(function () use ($id) {

            $aturan = RndTobaccoAturan::onlyTrashed()
                ->findOrFail($id);

            $aturan->restore();

            $aturan->details()
                ->withTrashed()
                ->restore();

            return $aturan->fresh('details');
        });
    }

    /**
     * Menghapus aturan secara permanen.
     */
    public function forceDelete(string $id): void
    {
        DB::transaction(function () use ($id) {

            $aturan = RndTobaccoAturan::withTrashed()
                ->findOrFail($id);

            $aturan->details()
                ->withTrashed()
                ->forceDelete();

            $aturan->forceDelete();
        });
    }
}
