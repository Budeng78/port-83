<?php

namespace Modules\Application\Timbangan\Services\Pos1;

use Modules\Application\Timbangan\Models\Pos1\Pos1Timbang1;
use Modules\Application\Timbangan\Models\Pos1\Target;

class TimbanganReportService
{
    /**
     * Daftar laporan penimbangan yang sudah selesai
     */
    public function getAll()
    {
        return Target::query()
            ->where('status', 'finish')
            ->with([
                'aturan.detail',
            ])
            ->withCount('aturan')
            ->orderByDesc('tanggal')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($target) {

                $target->jumlah_bal = $target->aturan
                    ->flatMap(function ($aturan) {
                        return $aturan->detail;
                    })
                    ->sum('jumlah_bal');

                return $target;
            });
    }

    /**
     * Detail laporan penimbangan berdasarkan Target
     */
    public function getByTarget(string $targetId)
    {
        $target = Target::query()
            ->where('status', 'finish')
            ->with([
                'aturan.detail',
            ])
            ->findOrFail($targetId);

        $timbangan = Pos1Timbang1::query()
            ->where('target_id', $targetId)
            ->orderBy('nomor_bal')
            ->get();

        return [
            'target'    => $target,
            'timbangan' => $timbangan,
        ];
    }
}
