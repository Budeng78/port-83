<?php

namespace Modules\Application\Timbangan\Http\Controllers\Pos1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Application\Timbangan\Http\Request\Pos1\Pos1TargetRequest;
use Modules\Application\Timbangan\Services\Pos1\Pos1TargetService;

class Pos1TargetController extends Controller
{
    public function __construct(
        protected Pos1TargetService $service
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(
            $this->service->getAll()
        );
    }

    public function store(Pos1TargetRequest $request): JsonResponse
    {
        $target = $this->service->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Target berhasil dibuat.',
            'data'    => $target,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getById($id),
        ]);
    }

    public function update(
        Pos1TargetRequest $request,
        string $id
    ): JsonResponse {
        $target = $this->service->update(
            $id,
            $request->validated()
        );

        return response()->json([
            'message' => 'Target berhasil diperbarui.',
            'data'    => $target,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Target berhasil dihapus.',
        ]);
    }
}
