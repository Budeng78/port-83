<?php
namespace Modules\Business\rnd\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Business\rnd\Models\TobaccoAturan;
use Modules\Business\rnd\Http\Requests\TobaccoAturanRequest;

class TobaccoAturanController extends Controller
{
    /**
     * Menampilkan daftar semua aturan tembakau.
     */
    public function index()
    {
        $data = TobaccoAturan::latest()->get();
        $totalRencana = $data->sum('rencana');

        return response()->json([
            'success' => true,
            'message' => 'Daftar aturan tembakau berhasil diambil',
            'total_rencana' => $totalRencana,
            'data' => $data
        ], 200);
    }

    /**
     * Menyimpan data aturan tembakau baru menggunakan TobaccoAturanRequest.
     */
    public function store(TobaccoAturanRequest $request)
    {
        $aturan = TobaccoAturan::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Aturan tembakau berhasil ditambahkan',
            'data' => $aturan
        ], 201);
    }

    /**
     * Menampilkan detail aturan tembakau berdasarkan ID.
     */
    public function show($id)
    {
        $aturan = TobaccoAturan::findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail aturan tembakau ditemukan',
            'data' => $aturan
        ], 200);
    }

    /**
     * Mengubah data aturan tembakau menggunakan TobaccoAturanRequest.
     */
    public function update(TobaccoAturanRequest $request, $id)
    {
        $aturan = TobaccoAturan::findOrFail($id);
        $aturan->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Aturan tembakau berhasil diperbarui',
            'data' => $aturan
        ], 200);
    }

    /**
     * Menghapus data aturan tembakau (Soft Delete).
     */
    public function destroy($id)
    {
        $aturan = TobaccoAturan::findOrFail($id);
        $aturan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aturan tembakau berhasil dihapus'
        ], 200);
    }
}