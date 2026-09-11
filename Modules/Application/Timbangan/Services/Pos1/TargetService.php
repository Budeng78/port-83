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

    /**
     * Generate kode batch berikutnya.
     */
    /**
     * Generate kode batch berikutnya.
     */
    public function getNextKodeBatch(): string
    {
        $tahun = now()->year;
        $bulan = now()->format('m');
        $tahunDuaDigit = now()->format('y');

        $lastKode = Target::query()
            ->whereYear('created_at', $tahun)
            ->orderByDesc('created_at')
            ->value('kode_batch');

        $nomor = 1;

        if (
            $lastKode &&
            preg_match(
                '/^(\d+)-\d{4}-BATCH-POS1$/',
                $lastKode,
                $match
            )
        ) {
            $nomor = ((int) $match[1]) + 1;
        }

        return str_pad($nomor, 3, '0', STR_PAD_LEFT)
            . '-' . $bulan . $tahunDuaDigit
            . '-BATCH-POS1';
    }
}