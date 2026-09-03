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
        return Pos1Target::create($data);
    }

    public function update(string $id, array $data): Pos1Target
    {
        $target = $this->getById($id);

        $target->update($data);

        return $target->fresh();
    }

    public function delete(string $id): void
    {
        $target = $this->getById($id);

        $target->delete();
    }
}
