<?php

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Antisipasi jika token tidak valid atau sesi habis
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            // Contoh data menu (sesuaikan dengan tabel database Anda nantinya)
            $menus = [
                [
                    'title' => 'Dashboard Utama',
                    'path' => '/app/dashboard',
                    'icon' => 'Home'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $menus
            ], 200);

        } catch (\Exception $e) {
            // Mengembalikan pesan error spesifik untuk debugging
            return response()->json([
                'success' => false,
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }
}