<?php

namespace Modules\Application\Timbangan\Http\Controllers\Pos1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Application\Timbangan\Http\Request\Pos1\TargetRequest;
use Modules\Application\Timbangan\Models\Pos1\Target;
use Modules\Application\Timbangan\Services\Pos1\TargetService;

class TargetController extends Controller
{
    public function __construct(
        protected TargetService $service
    ) {}

    /**
     * Daftar target.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getAll(),
        ]);
    }

    /**
     * Simpan target baru.
     */
    public function store(TargetRequest $request): JsonResponse
    {
        $target = $this->service->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Target berhasil dibuat.',
            'data'    => $target,
        ], 201);
    }

    /**
     * Detail target.
     */
    public function show(Target $target): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getById($target->id),
        ]);
    }

    /**
     * Update target.
     */
    public function update(
        TargetRequest $request,
        Target $target
    ): JsonResponse {
        $target = $this->service->update(
            $target,
            $request->validated()
        );

        return response()->json([
            'message' => 'Target berhasil diperbarui.',
            'data'    => $target,
        ]);
    }

    /**
     * Hapus target.
     */
    public function destroy(Target $target): JsonResponse
    {
        $this->service->delete($target);

        return response()->json([
            'message' => 'Target berhasil dihapus.',
        ]);
    }
    /**
     * Kode batch berikutnya.
     */
    public function nextCode(): JsonResponse
    {
        return response()->json([
            'kode_batch' => $this->service->getNextKodeBatch(),
        ]);
    }
}