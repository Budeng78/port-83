<?php

namespace Modules\Business\Rnd\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Business\Rnd\Requests\RndAturanTbkKirimanRequest;
use Modules\Business\Rnd\Services\RndAturanTbkKirimanService;

class RndAturanTbkKirimanController extends Controller
{
    public function __construct(
        protected RndAturanTbkKirimanService $service
    ) {}

    /**
     * List kiriman berdasarkan aturan.
     */
    public function index(string $aturanId): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getByAturan($aturanId),
        ]);
    }

    /**
     * Tampilkan satu kiriman.
     */
    public function show(string $id): JsonResponse
    {
        return response()->json([
            'data' => $this->service->find($id),
        ]);
    }

    /**
     * Simpan kiriman + detail.
     */
    public function store(
        string $aturanId,
        RndAturanTbkKirimanRequest $request
    ): JsonResponse {
        $kiriman = $this->service->store(
            $aturanId,
            $request->validated()
        );

        return response()->json([
            'message' => 'Kiriman berhasil disimpan.',
            'data' => $kiriman,
        ], 201);
    }

    /**
     * Update kiriman + detail.
     */
    public function update(
        RndAturanTbkKirimanRequest $request,
        string $id
    ): JsonResponse {
        $kiriman = $this->service->update(
            $id,
            $request->validated()
        );

        return response()->json([
            'message' => 'Kiriman berhasil diperbarui.',
            'data' => $kiriman,
        ]);
    }

    /**
     * Soft delete kiriman.
     */
    public function destroy(string $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Kiriman berhasil dihapus.',
        ]);
    }

    /**
     * List kiriman yang berada di trash.
     */
    public function trash(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->getTrash(),
        ]);
    }

    /**
     * Restore kiriman.
     */
    public function restore(string $id): JsonResponse
    {
        $kiriman = $this->service->restore($id);

        return response()->json([
            'message' => 'Kiriman berhasil dipulihkan.',
            'data' => $kiriman,
        ]);
    }

    /**
     * Hapus permanen kiriman.
     */
    public function forceDelete(string $id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'message' => 'Kiriman berhasil dihapus permanen.',
        ]);
    }
}