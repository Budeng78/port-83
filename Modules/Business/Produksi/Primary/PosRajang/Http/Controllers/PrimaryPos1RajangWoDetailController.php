<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Routing\Controller;
use Modules\Business\Produksi\Primary\PosRajang\Models\PrimaryPos1RajangWo;
use Modules\Business\Produksi\Primary\PosRajang\Models\PrimaryPos1RajangWoDetail;

class PrimaryPos1RajangWoDetailController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    | GET /api/posrajang/wo/{wo_id}/detail
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request,
        string $wo_id
    ): JsonResponse {

        $wo = PrimaryPos1RajangWo::query()
            ->where('id', $wo_id)
            ->first();

        if (!$wo) {
            return response()->json([
                'success' => false,
                'message' => 'Work Order tidak ditemukan.',
            ], 404);
        }

        $query = PrimaryPos1RajangWoDetail::query()
            ->where('wo_id', $wo_id)
            ->orderBy('no_urut');

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {

            $search = trim(
                $request->input('search')
            );

            $query->where(function ($q) use ($search) {

                $q->where(
                    'gudang',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'jenis_tbk',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    's_k',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'grade',
                    'like',
                    "%{$search}%"
                );

            });
        }

        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        $perPage = (int) $request->input(
            'per_page',
            15
        );

        $perPage = min(
            max($perPage, 1),
            100
        );

        $data = $query
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Data detail WO berhasil diambil.',
            'data' => $data,
            'wo' => $wo,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    | POST /api/posrajang/wo/{wo_id}/detail
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        string $wo_id
    ): JsonResponse {

        $wo = PrimaryPos1RajangWo::query()
            ->where('id', $wo_id)
            ->first();

        if (!$wo) {
            return response()->json([
                'success' => false,
                'message' => 'Work Order tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([

            'no_urut' => [
                'required',
                'integer',
                'min:1',
                Rule::unique(
                    'primary_pos1_rajang_wo_detail',
                    'no_urut'
                )->where(function ($query) use ($wo_id) {
                    return $query->where(
                        'wo_id',
                        $wo_id
                    );
                }),
            ],

            'gudang' => [
                'required',
                'string',
                'max:100',
            ],

            'jenis_tbk' => [
                'required',
                'string',
                'max:100',
            ],

            'tahun' => [
                'required',
                'integer',
                'min:1900',
                'max:9999',
            ],

            's_k' => [
                'required',
                'string',
                'max:100',
            ],

            'grade' => [
                'required',
                'string',
                'max:50',
            ],

            'jml_bal' => [
                'required',
                'integer',
                'min:1',
            ],

            'tara' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'bruto' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'netto' => [
                'nullable',
                'numeric',
                'min:0',
            ],

        ]);

        try {

            $detail = DB::transaction(function () use (
                $validated,
                $wo_id
            ) {

                $detail = new PrimaryPos1RajangWoDetail();

                $detail->wo_id = $wo_id;
                $detail->no_urut = $validated['no_urut'];
                $detail->gudang = $validated['gudang'];
                $detail->jenis_tbk = $validated['jenis_tbk'];
                $detail->tahun = $validated['tahun'];
                $detail->s_k = $validated['s_k'];
                $detail->grade = $validated['grade'];
                $detail->jml_bal = $validated['jml_bal'];

                $detail->tara =
                    $validated['tara'] ?? 0;

                $detail->bruto =
                    $validated['bruto'] ?? 0;

                $detail->netto =
                    $validated['netto'] ?? 0;

                $detail->save();

                return $detail->fresh();
            });

            return response()->json([
                'success' => true,
                'message' => 'Detail WO berhasil dibuat.',
                'data' => $detail,
            ], 201);

        } catch (\Throwable $e) {

            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat detail WO.',
                'error' => config(
                    'app.debug'
                )
                    ? $e->getMessage()
                    : null,
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    | GET /api/posrajang/wo/{wo_id}/detail/{id}
    |--------------------------------------------------------------------------
    */

    public function show(
        string $wo_id,
        string $id
    ): JsonResponse {

        $detail = PrimaryPos1RajangWoDetail::query()
            ->where('wo_id', $wo_id)
            ->where('id', $id)
            ->first();

        if (!$detail) {

            return response()->json([
                'success' => false,
                'message' => 'Detail WO tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail WO berhasil diambil.',
            'data' => $detail,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    | PUT/PATCH /api/posrajang/wo/{wo_id}/detail/{id}
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        string $wo_id,
        string $id
    ): JsonResponse {

        $detail = PrimaryPos1RajangWoDetail::query()
            ->where('wo_id', $wo_id)
            ->where('id', $id)
            ->first();

        if (!$detail) {

            return response()->json([
                'success' => false,
                'message' => 'Detail WO tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([

            'no_urut' => [
                'required',
                'integer',
                'min:1',
                Rule::unique(
                    'primary_pos1_rajang_wo_detail',
                    'no_urut'
                )
                    ->where(function ($query) use ($wo_id) {
                        return $query->where(
                            'wo_id',
                            $wo_id
                        );
                    })
                    ->ignore($detail->id),
            ],

            'gudang' => [
                'required',
                'string',
                'max:100',
            ],

            'jenis_tbk' => [
                'required',
                'string',
                'max:100',
            ],

            'tahun' => [
                'required',
                'integer',
                'min:1900',
                'max:9999',
            ],

            's_k' => [
                'required',
                'string',
                'max:100',
            ],

            'grade' => [
                'required',
                'string',
                'max:50',
            ],

            'jml_bal' => [
                'required',
                'integer',
                'min:1',
            ],

            'tara' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'bruto' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'netto' => [
                'nullable',
                'numeric',
                'min:0',
            ],

        ]);

        try {

            DB::transaction(function () use (
                $detail,
                $validated
            ) {

                $detail->no_urut =
                    $validated['no_urut'];

                $detail->gudang =
                    $validated['gudang'];

                $detail->jenis_tbk =
                    $validated['jenis_tbk'];

                $detail->tahun =
                    $validated['tahun'];

                $detail->s_k =
                    $validated['s_k'];

                $detail->grade =
                    $validated['grade'];

                $detail->jml_bal =
                    $validated['jml_bal'];

                $detail->tara =
                    $validated['tara'] ?? 0;

                $detail->bruto =
                    $validated['bruto'] ?? 0;

                $detail->netto =
                    $validated['netto'] ?? 0;

                $detail->save();
            });

            return response()->json([
                'success' => true,
                'message' => 'Detail WO berhasil diperbarui.',
                'data' => $detail->fresh(),
            ]);

        } catch (\Throwable $e) {

            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui detail WO.',
                'error' => config(
                    'app.debug'
                )
                    ? $e->getMessage()
                    : null,
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | DESTROY
    |--------------------------------------------------------------------------
    | DELETE /api/posrajang/wo/{wo_id}/detail/{id}
    |--------------------------------------------------------------------------
    */

    public function destroy(
        string $wo_id,
        string $id
    ): JsonResponse {

        $detail = PrimaryPos1RajangWoDetail::query()
            ->where('wo_id', $wo_id)
            ->where('id', $id)
            ->first();

        if (!$detail) {

            return response()->json([
                'success' => false,
                'message' => 'Detail WO tidak ditemukan.',
            ], 404);
        }

        try {

            $detail->delete();

            return response()->json([
                'success' => true,
                'message' => 'Detail WO berhasil dipindahkan ke trash.',
            ]);

        } catch (\Throwable $e) {

            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus detail WO.',
                'error' => config(
                    'app.debug'
                )
                    ? $e->getMessage()
                    : null,
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | RESTORE
    |--------------------------------------------------------------------------
    | POST /api/posrajang/wo/{wo_id}/detail/{id}/restore
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $wo_id,
        string $id
    ): JsonResponse {

        $detail = PrimaryPos1RajangWoDetail::withTrashed()
            ->where('wo_id', $wo_id)
            ->where('id', $id)
            ->first();

        if (!$detail) {

            return response()->json([
                'success' => false,
                'message' => 'Detail WO tidak ditemukan.',
            ], 404);
        }

        if (!$detail->trashed()) {

            return response()->json([
                'success' => false,
                'message' => 'Detail WO masih aktif.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | CEK NO URUT
        |--------------------------------------------------------------------------
        */

        $duplicate = PrimaryPos1RajangWoDetail::query()
            ->where('wo_id', $wo_id)
            ->where(
                'no_urut',
                $detail->no_urut
            )
            ->exists();

        if ($duplicate) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Tidak dapat restore. ' .
                    'Nomor urut sudah digunakan oleh detail aktif.',
            ], 422);
        }

        try {

            $detail->restore();

            return response()->json([
                'success' => true,
                'message' => 'Detail WO berhasil dipulihkan.',
                'data' => $detail->fresh(),
            ]);

        } catch (\Throwable $e) {

            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memulihkan detail WO.',
                'error' => config(
                    'app.debug'
                )
                    ? $e->getMessage()
                    : null,
            ], 500);
        }
    }
}