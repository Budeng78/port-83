<?php

namespace Modules\Application\Timbangan\Services\Pos1;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\Application\Timbangan\Models\Pos1Target;

class Pos1TargetService
{
    public function getAll(int $perPage = 20): LengthAwarePaginator
    {
        return Pos1Target::query()
            ->orderByDesc('tanggal')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getById(string $id): Pos1Target
    {
        return Pos1Target::findOrFail($id);
    }

    public function create(array $data): Pos1Target
    {
        unset($data['kode_batch']);
        return Pos1Target::create($data);
    }

    public function update(string $id, array $data): Pos1Target
    {
        $target = $this->getById($id);
        unset($data['kode_batch']);
        $target->update($data);

        return $target->fresh();
    }

    public function delete(string $id): void
    {
        $target = $this->getById($id);
        $target->delete();
    }

    public function generateBatchCode(string $tanggal): string
    {
        $dateFormatted = date('Ymd', strtotime($tanggal));

        // PERBAIKAN: Ganti Pos1TargetBatch menjadi Pos1Target
        $latestBatch = Pos1Target::where('tanggal', $tanggal)
            ->where('kode_batch', 'LIKE', "BATCH-{$dateFormatted}-%")
            ->orderBy('kode_batch', 'desc')
            ->first();

        if ($latestBatch) {
            $lastNum = (int) substr($latestBatch->kode_batch, -3);
            $nextNum = str_pad($lastNum + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $nextNum = '001';
        }

        return "BATCH-{$dateFormatted}-{$nextNum}";
    }
}