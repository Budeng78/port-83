<?php

namespace Modules\Application\Timbangan\Http\Controllers\Pos1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Application\Timbangan\Services\Pos1\TimbanganReportService;

class TimbanganReportController extends Controller
{
    public function __construct(
        protected TimbanganReportService $service
    ) {}

    /**
     * Daftar laporan penimbangan
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->service->getAll(),
        ]);
    }

    /**
     * Detail laporan penimbangan
     */
    public function show(string $targetId): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->service->getByTarget($targetId),
        ]);
    }
}