<?php

use Illuminate\Support\Facades\Route;
use Modules\Dashboard\Http\Controllers\DashboardControllers;

/* Hapus 'auth:sanctum' dari route web utama SPA agar file blade React bisa dimuat browser
Route::middleware(['web'])->group(function () {
    Route::get('/app/{any?}', [DashboardControllers::class, 'index'])->where('any', '.*');
});
*/