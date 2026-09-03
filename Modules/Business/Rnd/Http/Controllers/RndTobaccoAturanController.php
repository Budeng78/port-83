<?php

namespace Modules\Business\Rnd\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Business\Rnd\Services\RndTobaccoAturanService;

class RndTobaccoAturanController extends Controller
{
    public function __construct(
        protected RndTobaccoAturanService $service
    ) {}

    /**
     * Menampilkan seluruh aturan tembakau.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(
            max((int) $request->input('per_page', 20), 1),
            100
        );

        $data = $this->service->getAll(
            $request->input('search'),
            $perPage
        );

        return response()->json([
            'success' => true,
            'message' => 'Daftar aturan tembakau berhasil diambil.',
            'data' => $data,
        ]);
    }

    /**
     * Menyimpan aturan tembakau beserta detail.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kode_aturan' => [
                'required',
                'string',
                'max:100',
            ],

            'tanggal_aturan' => [
                'required',
                'date',
            ],

            'details' => [
                'nullable',
                'array',
            ],

            'details.*.type' => [
                'required',
                'string',
                'max:50',
            ],

            'details.*.gdg' => [
                'nullable',
                'string',
                'max:50',
            ],

            'details.*.jenis_tembakau' => [
                'required',
                'string',
                'max:100',
            ],

            'details.*.tahun' => [
                'required',
                'integer',
            ],

            'details.*.s_k' => [
                'nullable',
                'string',
                'max:20',
            ],

            'details.*.grade' => [
                'nullable',
                'string',
                'max:50',
            ],

            'details.*.rencana' => [
                'required',
                'numeric',
            ],
        ]);

        $aturan = $this->service->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Aturan tembakau berhasil ditambahkan.',
            'data' => $aturan,
        ], 201);
    }

    /**
     * Menampilkan satu aturan beserta detailnya.
     */
    public function show(string $id): JsonResponse
    {
        $aturan = $this->service->getById($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail aturan tembakau berhasil diambil.',
            'data' => $aturan,
        ]);
    }

    /**
     * Mengubah aturan beserta seluruh detailnya.
     */

    public function update(
        Request $request,
        string $id
    ): JsonResponse {
        $data = $request->validate([
            'kode_aturan' => [
                'required',
                'string',
                'max:100',
            ],

            'tanggal_aturan' => [
                'required',
                'date',
            ],

            'details' => [
                'nullable',
                'array',
            ],

            'details.*.id' => [
                'nullable',
                'uuid',
            ],

            'details.*.type' => [
                'required',
                'string',
                'max:50',
            ],

            'details.*.gdg' => [
                'nullable',
                'string',
                'max:50',
            ],

            'details.*.jenis_tembakau' => [
                'required',
                'string',
                'max:100',
            ],

            'details.*.tahun' => [
                'required',
                'integer',
            ],

            'details.*.s_k' => [
                'nullable',
                'string',
                'max:20',
            ],

            'details.*.grade' => [
                'nullable',
                'string',
                'max:50',
            ],

            'details.*.rencana' => [
                'required',
                'numeric',
            ],
        ]);

        $aturan = $this->service->update($id, $data);

        return response()->json([
            'success' => true,
            'message' => 'Aturan tembakau berhasil diperbarui.',
            'data' => $aturan,
        ]);
    }



    /**
     * Menghapus aturan beserta detailnya.
     */
    public function destroy(string $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Aturan tembakau berhasil dihapus.',
        ]);
    }

    /**
     * Menampilkan aturan yang berada di trash.
     */
    public function trash(): JsonResponse
    {
        $data = $this->service->getTrash();

        return response()->json([
            'success' => true,
            'message' => 'Data trash aturan tembakau berhasil diambil.',
            'data' => $data,
        ]);
    }

    /**
     * Mengembalikan aturan dari trash.
     */
    public function restore(string $id): JsonResponse
    {
        $aturan = $this->service->restore($id);

        return response()->json([
            'success' => true,
            'message' => 'Aturan tembakau berhasil dipulihkan.',
            'data' => $aturan,
        ]);
    }

    /**
     * Menghapus aturan secara permanen.
     */
    public function forceDelete(string $id): JsonResponse
    {
        $this->service->forceDelete($id);

        return response()->json([
            'success' => true,
            'message' => 'Aturan tembakau berhasil dihapus permanen.',
        ]);
    }


}
