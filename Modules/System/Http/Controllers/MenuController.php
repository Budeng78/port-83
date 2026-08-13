<?php

namespace Modules\System\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\System\Services\MenuService;
use Illuminate\Support\Facades\Log;
use Modules\System\Models\Menu;

class MenuController extends Controller
{
    protected $menuService;

    public function __construct(MenuService $menuService)
    {
        $this->menuService = $menuService;
    }

    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $menuTree = $this->menuService->getMenuTreeForUser($user);

            return response()->json([
                'success' => true,
                'data' => $menuTree
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'path' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'permission_name' => 'nullable|string|max:255',
            'parent_id' => 'nullable|uuid|exists:menus,id', // Diperketat dengan uuid & exists
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $menu = Menu::create($validated);

        // Muat relasi agar data pembuat ikut terkirim ke frontend
        $menu->load(['createdBy', 'updatedBy', 'parent']);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil disimpan',
            'data' => $menu
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Data menu tidak ditemukan.'
            ], 404);
        }

        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'path' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'permission_name' => 'nullable|string|max:255',
            'parent_id' => 'nullable|uuid|exists:menus,id',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if (!empty($validated['parent_id']) && $validated['parent_id'] === $menu->id) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak dapat menjadi induk bagi dirinya sendiri.'
            ], 422);
        }

        $menu->update($validated);

        // Muat ulang relasi setelah update
        $menu->load(['createdBy', 'updatedBy', 'parent']);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil diperbarui',
            'data' => $menu
        ], 200);
    }

    public function destroy($id)
    {
        $menu = Menu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Data menu tidak ditemukan atau sudah dihapus sebelumnya.'
            ], 404);
        }

        if ($menu->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus! Menu ini memiliki sub-menu. Hapus sub-menu terlebih dahulu.'
            ], 422);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus.'
        ]);
    }
}