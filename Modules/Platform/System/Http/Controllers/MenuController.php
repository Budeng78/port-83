<?php

namespace Modules\Platform\System\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Platform\System\Models\Menu;

class MenuController extends Controller
{
    /**
     * GET /api/system/menus
     *
     * Untuk halaman Management Menu:
     * menampilkan seluruh menu aktif/nonaktif
     * dalam bentuk tree.
     *
     * Catatan:
     * Endpoint ini adalah endpoint MASTER MENU.
     * Tidak difilter berdasarkan user.
     */
    public function index(): JsonResponse
    {
        $menus = Menu::query()
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $this->buildTree($menus),
        ]);
    }

    /**
     * POST /api/system/menus
     *
     * Membuat menu baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => [
                'required',
                'string',
                'max:255',
            ],

            'path' => [
                'nullable',
                'string',
                'max:255',
            ],

            'icon' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
             * =====================================================
             * ORGANIZATION UNIT
             * =====================================================
             *
             * Menentukan Organization Unit yang menjadi
             * scope/menu area.
             *
             * Nilai yang disimpan adalah:
             *
             * organization_units.name
             *
             * Bukan ID dan bukan code.
             *
             * Contoh:
             *
             * system
             * produksi
             * gudang
             * qc
             */
            'organization_unit_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
             * =====================================================
             * PERMISSION
             * =====================================================
             *
             * Menentukan fungsi/permission yang dibutuhkan
             * untuk mengakses menu.
             *
             * Contoh:
             *
             * plan.view
             * plan.create
             * plan.edit
             * plan.delete
             */
            'permission_key' => [
                'nullable',
                'string',
                'max:255',
            ],

            'parent_id' => [
                'nullable',
                'uuid',
                'exists:menus,id',
            ],

            'order' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'is_active' => [
                'boolean',
            ],
        ]);

        $menu = Menu::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil disimpan.',
            'data' => $menu,
        ], 201);
    }

    /**
     * GET /api/system/menus/{menu}
     *
     * Menampilkan detail satu menu.
     */
    public function show(Menu $menu): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $menu,
        ]);
    }

    /**
     * PUT/PATCH /api/system/menus/{menu}
     *
     * Memperbarui menu.
     */
    public function update(
        Request $request,
        Menu $menu
    ): JsonResponse {
        $validated = $request->validate([
            'label' => [
                'required',
                'string',
                'max:255',
            ],

            'path' => [
                'nullable',
                'string',
                'max:255',
            ],

            'icon' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
             * =====================================================
             * ORGANIZATION UNIT
             * =====================================================
             */
            'organization_unit_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
             * =====================================================
             * PERMISSION
             * =====================================================
             */
            'permission_key' => [
                'nullable',
                'string',
                'max:255',
            ],

            'parent_id' => [
                'nullable',
                'uuid',
                'exists:menus,id',
            ],

            'order' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'is_active' => [
                'boolean',
            ],
        ]);

        /*
         * =========================================================
         * CEGAH SELF PARENT
         * =========================================================
         */
        if (
            !empty($validated['parent_id']) &&
            (string) $validated['parent_id'] ===
            (string) $menu->id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Menu tidak dapat menjadi induk dirinya sendiri.',
            ], 422);
        }

        /*
         * =========================================================
         * CEGAH CIRCULAR PARENT
         * =========================================================
         *
         * Contoh:
         *
         * A
         * └── B
         *
         * A tidak boleh dipindahkan menjadi child B.
         */
        if (
            !empty($validated['parent_id'])
        ) {
            $parent = Menu::find(
                $validated['parent_id']
            );

            if (
                $parent &&
                $this->isDescendantOf(
                    $parent,
                    $menu->id
                )
            ) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'Menu tidak dapat dipindahkan ke salah satu turunannya.',
                ], 422);
            }
        }

        $menu->update($validated);

        return response()->json([
            'success' => true,
            'message' =>
                'Menu berhasil diperbarui.',
            'data' => $menu->fresh(),
        ]);
    }

    /**
     * DELETE /api/system/menus/{menu}
     *
     * Menghapus menu.
     */
    public function destroy(
        Menu $menu
    ): JsonResponse {
        /*
         * Jangan hapus parent yang masih
         * mempunyai children.
         */
        if (
            $menu->children()->exists()
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Gagal menghapus. Menu ini masih memiliki submenu.',
            ], 422);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'Menu berhasil dihapus.',
        ]);
    }

    /**
     * Build menu tree.
     */
    private function buildTree(
        $menus,
        $parentId = null
    ) {
        return $menus
            ->filter(
                function ($menu) use ($parentId) {

                    if ($parentId === null) {
                        return $menu->parent_id === null;
                    }

                    return (string) $menu->parent_id ===
                        (string) $parentId;
                }
            )
            ->sortBy('order')
            ->map(
                function ($menu) use ($menus) {

                    $data = $menu->toArray();

                    $data['children'] =
                        $this->buildTree(
                            $menus,
                            $menu->id
                        )
                        ->values()
                        ->toArray();

                    return $data;
                }
            )
            ->values();
    }

    /**
     * Mengecek apakah sebuah menu merupakan
     * descendant dari menu tertentu.
     */
    private function isDescendantOf(
        Menu $menu,
        string $ancestorId
    ): bool {
        $current = $menu;

        while (
            $current->parent_id
        ) {
            if (
                (string) $current->parent_id ===
                $ancestorId
            ) {
                return true;
            }

            $current = Menu::find(
                $current->parent_id
            );

            if (!$current) {
                break;
            }
        }

        return false;
    }
}