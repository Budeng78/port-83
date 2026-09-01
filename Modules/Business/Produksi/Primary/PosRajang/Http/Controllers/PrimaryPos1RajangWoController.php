<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Http\Controllers;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\Rule;
use Modules\Business\Produksi\Primary\PosRajang\Models\PrimaryPos1RajangWo;
use Modules\Business\Produksi\Primary\PosRajang\Models\PrimaryPos1RajangWoDetail;

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

        if ($request->boolean('trash')) {

            $query->onlyTrashed();
        }


        /*
        |--------------------------------------------------------------------------
        | SORTING
        |--------------------------------------------------------------------------
        */

        $query->orderByDesc('created_at');


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

            /*
            |------------------------------------------------------------------
            | NOMOR WO
            |------------------------------------------------------------------
            */

            'no_wo' => [
                'required',
                'string',
                'max:50',
                'unique:primary_pos1_rajang_wo,no_wo',
            ],


            /*
            |------------------------------------------------------------------
            | TANGGAL WO
            |------------------------------------------------------------------
            */

            'tanggal_wo' => [
                'nullable',
                'date',
            ],


            /*
            |------------------------------------------------------------------
            | ATURAN
            |------------------------------------------------------------------
            */

            'aturan' => [
                'required',
                'string',
                'max:100',
            ],


            /*
            |------------------------------------------------------------------
            | JUMLAH BAL
            |------------------------------------------------------------------
            */

            'jumlah_bal' => [
                'required',
                'integer',
                'min:1',
            ],


            /*
            |------------------------------------------------------------------
            | STATUS
            |------------------------------------------------------------------
            */

            'status' => [
                'nullable',
                Rule::in([
                    'draft',
                    'open',
                    'closed',
                    'cancelled',
                ]),
            ],


            /*
            |------------------------------------------------------------------
            | KETERANGAN
            |------------------------------------------------------------------
            */

            'keterangan' => [
                'nullable',
                'string',
            ],

        ]);


        /*
        |--------------------------------------------------------------------------
        | DEFAULT STATUS
        |--------------------------------------------------------------------------
        */

        $validated['status'] =
            $validated['status'] ?? 'draft';


        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

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

   public function update(Request $request, string $id): JsonResponse
    {
        $wo = PrimaryPos1RajangWo::findOrFail($id);

        $validated = $request->validate([
            'no_wo' => [
                'required',
                'string',
                'max:100',
                Rule::unique('primary_pos1_rajang_wo', 'no_wo')
                    ->ignore($wo->id, 'id'),
            ],

            'tanggal_wo' => [
                'required',
                'date',
            ],

            'aturan' => [
                'required',
                'string',
                'max:100',
            ],

            'jumlah_bal' => [
                'required',
                'integer',
                'min:0',
            ],

            'status' => [
                'required',
                'string',
                'max:50',
            ],

            'keterangan' => [
                'nullable',
                'string',
            ],
        ]);

        $wo->update($validated);

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

public function destroy(string $id): JsonResponse
{
    DB::beginTransaction();

    try {

        $wo = PrimaryPos1RajangWo::query()
            ->findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | SOFT DELETE SEMUA DETAIL
        |--------------------------------------------------------------------------
        */

        PrimaryPos1RajangWoDetail::query()
            ->where('wo_id', $wo->id)
            ->delete();


        /*
        |--------------------------------------------------------------------------
        | SOFT DELETE WO HEADER
        |--------------------------------------------------------------------------
        */

        $wo->delete();


        DB::commit();

        return response()->json([
            'success' => true,
            'message' => "WO {$wo->no_wo} berhasil dihapus.",
        ]);

    } catch (\Throwable $e) {

        DB::rollBack();

        report($e);

        return response()->json([
            'success' => false,
            'message' => 'Gagal menghapus WO.',
            'error'   => $e->getMessage(),
        ], 500);
    }
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