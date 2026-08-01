<?php

use Illuminate\Support\Facades\Route;

Route::prefix('app')->group(function () {
    // Rute login dengan nama agar middleware auth Laravel berfungsi
    Route::get('/login', function () {
        return view('auth::app');
    })->name('login');
    Route::get('/dashboard', function () {
        // Sesuaikan dengan view dari modul dashboard Anda (contoh: dashboard::app atau dashboard::index)
        return view('dashboard::app'); 
    });
    // Menangkap semua sisa rute di bawah /app/* ke React Router
    Route::get('/{any?}', function () {
        return view('auth::app');
    })->where('any', '.*');
});