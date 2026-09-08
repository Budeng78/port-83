<?php

namespace Modules\Application\Timbangan\Http\Controllers\Pos1;

use Illuminate\Http\JsonResponse;
use Modules\Application\Timbangan\Http\Request\Pos1\TargetAturanDetailRequest;
use Modules\Application\Timbangan\Services\Pos1\TargetAturanDetailService;

class TargetAturanDetailController
{
    public function __construct(
        private TargetAturanDetailService $service
    ) {}

    public function index(string $targetAturan): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getByAturan($targetAturan),
        ]);
    }

    public function store(TargetAturanDetailRequest $request): JsonResponse
    {
        $detail = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Detail berhasil dibuat.',
            'data'    => $detail,
        ], 201);
    }

    public function show(string $targetAturan, string $detailId): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getById($detailId),
        ]);
    }

    public function update(
        TargetAturanDetailRequest $request,
        string $targetAturan,
        string $detailId
    ): JsonResponse {
        $detail = $this->service->getById($detailId);

        return response()->json([
            'message' => 'Detail berhasil diperbarui.',
            'data'    => $this->service->update(
                $detail,
                $request->validated()
            ),
        ]);
    }

    public function destroy(
        string $targetAturan,
        string $detailId
    ): JsonResponse {
        $detail = $this->service->getById($detailId);

        $this->service->delete($detail);

        return response()->json([
            'message' => 'Detail berhasil dihapus.',
        ]);
    }
}