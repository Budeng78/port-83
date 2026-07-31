<?php

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Core\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Ambil daftar menu dinamis berdasarkan akses user secara rekursif.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Ambil menu utama (parent_id null) yang aktif, diurutkan berdasarkan 'order'
        $menus = Menu::with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();

        // Transformasi menggunakan helper rekursif
        $formattedMenus = $menus->map(fn($menu) => $this->transformMenu($menu, $user))
            ->filter()
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => $formattedMenus
        ]);
    }

    /**
     * Helper rekursif untuk mentransformasi menu beserta anak/cucunya.
     */
    private function transformMenu($menu, $user): ?array
    {
        // Cek permission jika didefinisikan
        if ($menu->permission_name && $user && !$user->can($menu->permission_name)) {
            return null;
        }

        // Transformasi children secara rekursif
        $children = $menu->children
            ->where('is_active', true)
            ->sortBy('order')
            ->map(fn($child) => $this->transformMenu($child, $user))
            ->filter()
            ->values();

        return [
            'label' => $menu->title,
            'path' => $menu->route,
            'icon' => $menu->icon, // Berisi string nama icon, misal: "Package", "Users", dll.
            'permission' => $menu->permission_name,
            'children' => $children->isNotEmpty() ? $children : []
        ];
    }
}