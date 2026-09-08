<?php

namespace Modules\Application\Timbangan\Services\Pos1;

use Illuminate\Support\Facades\DB;
use Modules\Application\Timbangan\Models\Pos1\TargetAturan;

class TargetAturanService
{
    /**
     * Ambil semua aturan berdasarkan target.
     */
    public function getByTarget(string $targetId)
    {
        return TargetAturan::query()
            ->where('target_id', $targetId)
            ->withCount('detail')
            ->orderBy('nomor_aturan')
            ->get();
    }


    /**
     * Ambil satu aturan beserta detailnya.
     */
    public function getById(string $id)
    {
        return TargetAturan::query()
            ->with('detail')
            ->findOrFail($id);
    }


    /**
     * Membuat aturan baru.
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            return TargetAturan::create([
                'target_id'    => $data['target_id'],
                'nomor_aturan' => $data['nomor_aturan'],
            ]);
        });
    }


    /**
     * Mengubah aturan.
     */
    public function update(TargetAturan $aturan, array $data)
    {
        return DB::transaction(function () use ($aturan, $data) {

            $aturan->update([
                'nomor_aturan' => $data['nomor_aturan'],
            ]);

            return $aturan->fresh();
        });
    }


    /**
     * Menghapus aturan.
     */
    public function delete(TargetAturan $aturan): void
    {
        DB::transaction(function () use ($aturan) {
            $aturan->delete();
        });
    }
}