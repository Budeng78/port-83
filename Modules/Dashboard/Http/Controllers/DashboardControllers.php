<?php

namespace Modules\Dashboard\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardControllers extends Controller
{
    /**
     * Menampilkan halaman utama dashboard SPA / React.
     */
    public function index()
    {
        // Pastikan view yang dipanggil sesuai dengan nama file blade ('app.blade.php')
        return view('dashboard::app');
    }
}