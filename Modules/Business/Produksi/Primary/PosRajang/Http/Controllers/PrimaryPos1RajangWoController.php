<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Modules\Business\Produksi\Primary\PosRajang\Models\PrimaryPos1RajangWo;

class PrimaryPos1RajangWoController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    | GET /api/posrajang/wo
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): JsonResponse
    {
        $query = PrimaryPos1RajangWo::query();

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {

            $search = trim($request->search);

            $query->where(function ($q) use ($search) {

                $q->where(
                    'no_wo',
                    'like',
                    "%{$search}%"
                );

            });
        }


        /*
        |--------------------------------------------------------------------------
        | FILTER STATUS
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('status') &&
            $request->status !== 'all'
        ) {

            $query->where(
                'status',
                $request->status
            );
        }


        /*
        |--------------------------------------------------------------------------
        | INCLUDE SOFT DELETED
        |--------------------------------------------------------------------------
        |
        | trash=1 digunakan halaman management
        | untuk melihat data yang sudah dihapus.
        |
        */

        if (
            $request->boolean('trash')
        ) {

            $query->onlyTrashed();

        }


        /*
        |--------------------------------------------------------------------------
        | SORTING
        |--------------------------------------------------------------------------
        */

        $query->orderByDesc(
            'created_at'
        );


        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        $perPage = (int) $request->input(
            'per_page',
            15
        );

        $perPage = max(
            1,
            min($perPage, 100)
        );


        $data = $query->paginate(
            $perPage
        );


        return response()->json([
            'success' => true,

            'message' => 'Data WO berhasil diambil.',

            'data' => $data,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    | POST /api/posrajang/wo
    |--------------------------------------------------------------------------
    */

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([

            'no_wo' => [
                'required',
                'string',
                'max:100',
                'unique:primary_pos1_rajang_wo,no_wo',
            ],

            'tanggal_wo' => [
                'nullable',
                'date',
            ],

            'jenis' => [
                'nullable',
                'string',
                'max:100',
            ],

            's_k' => [
                'nullable',
                'string',
                'max:100',
            ],

            'jumlah_bal' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'status' => [
                'nullable',
                Rule::in([
                    'draft',
                    'open',
                    'closed',
                    'cancelled',
                ]),
            ],

            'keterangan' => [
                'nullable',
                'string',
            ],

        ]);


        $validated['status'] =
            $validated['status'] ?? 'draft';


        $wo = PrimaryPos1RajangWo::create(
            $validated
        );


        return response()->json([
            'success' => true,

            'message' => 'WO berhasil dibuat.',

            'data' => $wo,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    | GET /api/posrajang/wo/{id}
    |--------------------------------------------------------------------------
    */

    public function show(
        PrimaryPos1RajangWo $wo
    ): JsonResponse {

        return response()->json([
            'success' => true,

            'message' => 'Data WO berhasil diambil.',

            'data' => $wo,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    | PUT/PATCH /api/posrajang/wo/{id}
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        PrimaryPos1RajangWo $wo
    ): JsonResponse {

        $validated = $request->validate([

            'no_wo' => [
                'required',
                'string',
                'max:100',
                Rule::unique(
                    'primary_pos1_rajang_wo',
                    'no_wo'
                )->ignore($wo->id),
            ],

            'tanggal_wo' => [
                'nullable',
                'date',
            ],

            'jenis' => [
                'nullable',
                'string',
                'max:100',
            ],

            's_k' => [
                'nullable',
                'string',
                'max:100',
            ],

            'jumlah_bal' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'status' => [
                'nullable',
                Rule::in([
                    'draft',
                    'open',
                    'closed',
                    'cancelled',
                ]),
            ],

            'keterangan' => [
                'nullable',
                'string',
            ],

        ]);


        $wo->update(
            $validated
        );


        return response()->json([
            'success' => true,

            'message' => 'WO berhasil diperbarui.',

            'data' => $wo->fresh(),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DESTROY
    |--------------------------------------------------------------------------
    | DELETE /api/posrajang/wo/{id}
    |--------------------------------------------------------------------------
    |
    | Soft delete.
    |
    */

    public function destroy(
        PrimaryPos1RajangWo $wo
    ): JsonResponse {

        $wo->delete();


        return response()->json([
            'success' => true,

            'message' => 'WO berhasil dihapus.',
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | RESTORE
    |--------------------------------------------------------------------------
    | POST /api/posrajang/wo/{id}/restore
    |--------------------------------------------------------------------------
    */

    public function restore(
        string $id
    ): JsonResponse {

        $wo = PrimaryPos1RajangWo::onlyTrashed()
            ->findOrFail($id);


        $wo->restore();


        return response()->json([
            'success' => true,

            'message' => 'WO berhasil dipulihkan.',

            'data' => $wo->fresh(),
        ]);
    }
}
