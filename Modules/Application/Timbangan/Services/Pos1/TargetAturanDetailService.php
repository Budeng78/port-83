<?php

namespace Modules\Application\Timbangan\Services\Pos1;

use Illuminate\Support\Facades\DB;
use Modules\Application\Timbangan\Models\Pos1\TargetAturanDetail;

class TargetAturanDetailService
{
    /**
     * Ambil semua detail berdasarkan aturan.
     */
    public function getByAturan(string $targetAturanId)
    {
        return TargetAturanDetail::query()
            ->where('target_aturan_id', $targetAturanId)
            ->orderBy('type')
            ->orderBy('jenis_tbk')
            ->get();
    }


    /**
     * Ambil satu detail.
     */
    public function getById(string $id)
    {
        return TargetAturanDetail::query()
            ->findOrFail($id);
    }


    /**
     * Membuat detail baru.
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            return TargetAturanDetail::create([
                'target_aturan_id' => $data['target_aturan_id'],
                'type'             => $data['type'],
                'jenis_tbk'        => $data['jenis_tbk'],
                'tahun'            => $data['tahun'],
                'grade'            => $data['grade'],
                's_k'              => $data['s_k'],
                'jumlah_bal'       => $data['jumlah_bal'],
                'berat_bruto'      => $data['berat_bruto'],
                'tara'             => $data['tara'],
            ]);
        });
    }


    /**
     * Mengubah detail.
     */
    public function update(
        TargetAturanDetail $detail,
        array $data
    ) {
        return DB::transaction(function () use ($detail, $data) {

            $detail->update([
                'type'       => $data['type'],
                'jenis_tbk'  => $data['jenis_tbk'],
                'tahun'      => $data['tahun'],
                'grade'      => $data['grade'],
                's_k'        => $data['s_k'],
                'jumlah_bal' => $data['jumlah_bal'],
                'berat_bruto'=> $data['berat_bruto'],
                'tara'       => $data['tara'],
            ]);

            return $detail->fresh();
        });
    }


    /**
     * Menghapus detail.
     */
    public function delete(TargetAturanDetail $detail): void
    {
        DB::transaction(function () use ($detail) {
            $detail->delete();
        });
    }
}