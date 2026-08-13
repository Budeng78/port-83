<?php

namespace Modules\System\Services;

use Illuminate\Support\Facades\DB;

class MenuService
{
    /**
     * Mengambil dan memfilter menu dari database untuk user tertentu.
     */
    public function getMenuTreeForUser($user)
    {
        $menus = DB::table('menus')
            ->where('is_active', 1)
            ->whereNull('deleted_at') // <-- Tambahkan baris ini untuk mengabaikan data yang sudah di-soft delete
            ->orderBy('order', 'asc')
            ->get();

        // Filter berdasarkan permission jika user bukan Super Admin
        $filteredMenus = $menus->filter(function ($menu) use ($user) {
            if (empty($menu->permission)) {
                return true; // Menu publik atau tanpa permission khusus
            }

            if (!$user) {
                return false;
            }

            $isSuperAdmin = method_exists($user, 'hasRole') && $user->hasRole('Super Admin');
            $hasPermission = method_exists($user, 'hasPermissionTo') && $user->hasPermissionTo($menu->permission);

            return $isSuperAdmin || $hasPermission;
        });

        // Ubah flat collection menjadi nested tree
        return $this->buildTree($filteredMenus, null);
    }

    /**
     * Fungsi rekursif untuk menyusun struktur Parent-Child.
     */
    protected function buildTree($menus, $parentId = null)
    {
        $branch = [];
        foreach ($menus as $menu) {
            if ($menu->parent_id == $parentId) {
                $children = $this->buildTree($menus, $menu->id);
                $menu->children = !empty($children) ? $children : [];
                $branch[] = $menu;
            }
        }
        return $branch;
    }
}