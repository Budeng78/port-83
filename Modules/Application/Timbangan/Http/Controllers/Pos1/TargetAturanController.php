<?php

namespace Modules\Application\Timbangan\Http\Controllers\Pos1;


use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Application\Timbangan\Pos1\Http\Requests\Pos1\TargetAturanRequest;
use Modules\Application\Timbangan\Models\Pos1\Target;
use Modules\Application\Timbangan\Models\Pos1\TargetAturan;
use Modules\Application\Timbangan\Services\Pos1\TargetAturanService;

class TargetAturanController extends Controller
{
    public function __construct(
        protected TargetAturanService $service
    ) {}

    /**
     * Daftar aturan berdasarkan target.
     */
    public function index(Target $target): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getByTarget(
                $target->id
            ),
        ]);
    }

    /**
     * Simpan aturan baru.
     */
    public function store(
        TargetAturanRequest $request
    ): JsonResponse {
        $aturan = $this->service->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Aturan berhasil dibuat.',
            'data'    => $aturan,
        ], 201);
    }

    /**
     * Detail aturan.
     */
    public function show(
        TargetAturan $targetAturan
    ): JsonResponse {
        return response()->json([
            'data' => $this->service->getById(
                $targetAturan->id
            ),
        ]);
    }

    /**
     * Update aturan.
     */
    public function update(
        TargetAturanRequest $request,
        TargetAturan $targetAturan
    ): JsonResponse {
        $aturan = $this->service->update(
            $targetAturan,
            $request->validated()
        );

        return response()->json([
            'message' => 'Aturan berhasil diperbarui.',
            'data'    => $aturan,
        ]);
    }

    /**
     * Hapus aturan.
     */
    public function destroy(
        TargetAturan $targetAturan
    ): JsonResponse {
        $this->service->delete($targetAturan);

        return response()->json([
            'message' => 'Aturan berhasil dihapus.',
        ]);
    }
}