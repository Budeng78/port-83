<?php

namespace Modules\Core\Services;

use Illuminate\Support\Facades\Auth;

class MenuService
{
    /**
     * Mengambil dan memfilter menu berdasarkan hak akses user yang sedang login.
     */
    public function getMenuForUser($user)
    {
        // Contoh query menu dari database (sesuaikan dengan struktur tabel Anda)
        // Bisa menggunakan relasi Role & Permission dari Spatie atau sistem custom Parjos
        
        $menus = [
            [
                'title' => 'Dashboard Utama',
                'path' => '/app/dashboard',
                'icon' => 'HomeIcon',
                'permission' => 'view-dashboard'
            ],
            [
                'title' => 'Manajemen User',
                'path' => '/app/users',
                'icon' => 'UsersIcon',
                'permission' => 'manage-users'
            ],
            // ... menu lainnya dari database
        ];

        // Filter menu berdasarkan permission user
        return array_filter($menus, function ($menu) use ($user) {
            if (!isset($menu['permission'])) return true;
            return $user->hasPermissionTo($menu['permission']) || $user->hasRole('Super Admin');
        });
    }
}