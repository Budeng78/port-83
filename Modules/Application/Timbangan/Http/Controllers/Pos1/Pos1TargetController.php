<?php

namespace Modules\Application\Timbangan\Http\Controllers\Pos1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Application\Timbangan\Http\Requests\Pos1\Pos1TargetRequest;
use Modules\Application\Timbangan\Services\Pos1\Pos1TargetService;

class Pos1TargetController extends Controller
{
    public function __construct(
        protected Pos1TargetService $service
    ) {}

    /**
     * Display a listing of targets
     * GET /timbangan/pos1/target?tanggal=YYYY-MM-DD
     */
    public function index(Request $request): JsonResponse
    {
        $tanggal = $request->query('tanggal');
        
        $targets = $this->service->getAll($tanggal);

        return response()->json([
            'success' => true,
            'data' => $targets,
            'message' => 'Data target berhasil diambil',
        ]);
    }

    /**
     * Store a newly created batch of targets
     * POST /timbangan/pos1/target
     * 
     * Request body:
     * {
     *   "kode_batch": "BATCH-20260907-001",
     *   "tanggal": "2026-09-07",
     *   "status": "pending",
     *   "items": [
     *     { "nomor_aturan": "AT-001", "jenis_tbk": "...", ... },
     *     { "nomor_aturan": "AT-001", "jenis_tbk": "...", ... }
     *   ]
     * }
     */
    public function store(Pos1TargetRequest $request): JsonResponse
    {
        $targets = $this->service->create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Target berhasil dibuat (' . $targets->count() . ' records).',
            'data' => $targets,
        ], 201);
    }

    /**
     * Display the specified target
     * GET /timbangan/pos1/target/{id}
     */
    public function show(string $id): JsonResponse
    {
        $target = $this->service->getById($id);

        return response()->json([
            'success' => true,
            'data' => $target,
        ]);
    }

    /**
     * Update the specified target
     * PUT/PATCH /timbangan/pos1/target/{id}
     */
    public function update(Pos1TargetRequest $request, string $id): JsonResponse
    {
        $target = $this->service->update(
            $id,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Target berhasil diperbarui.',
            'data' => $target,
        ]);
    }

    /**
     * Remove the specified target
     * DELETE /timbangan/pos1/target/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Target berhasil dihapus.',
        ]);
    }

    /**
     * Generate unique batch code
     * GET /timbangan/pos1/target/generate-batch-code?tanggal=YYYY-MM-DD
     */
    public function generateBatchCode(Request $request): JsonResponse
    {
        $tanggal = $request->query('tanggal', now()->format('Y-m-d'));
        
        $kodeBatch = $this->service->generateBatchCode($tanggal);

        return response()->json([
            'success' => true,
            'kode_batch' => $kodeBatch,
            'data' => [
                'kode_batch' => $kodeBatch,
            ],
        ]);
    }
}
