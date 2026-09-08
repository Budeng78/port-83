<?php

namespace Modules\Application\Timbangan\Services\Pos1;

use Illuminate\Support\Facades\DB;
use Modules\Application\Timbangan\Models\Pos1\Target;

class TargetService
{
    /**
     * Ambil daftar target.
     */
    public function getAll()
    {
        return Target::query()
            ->withCount('aturan')
            ->latest('tanggal')
            ->latest('created_at')
            ->get();
    }


    /**
     * Ambil satu target beserta aturan dan detail.
     */
    public function getById(string $id)
    {
        return Target::query()
            ->with([
                'aturan.detail',
            ])
            ->findOrFail($id);
    }


    /**
     * Membuat target baru.
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            return Target::create([
                'kode_batch' => $data['kode_batch'],
                'tanggal'    => $data['tanggal'],
                'status'     => $data['status'] ?? 'pending',
            ]);
        });
    }


    /**
     * Mengubah target.
     */
    public function update(Target $target, array $data)
    {
        return DB::transaction(function () use ($target, $data) {

            $target->update([
                'kode_batch' => $data['kode_batch'],
                'tanggal'    => $data['tanggal'],
                'status'     => $data['status'],
            ]);

            return $target->fresh();
        });
    }


    /**
     * Menghapus target.
     */
    public function delete(Target $target): void
    {
        DB::transaction(function () use ($target) {
            $target->delete();
        });
    }
}