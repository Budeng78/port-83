<?php

use Illuminate\Support\Facades\Route;

Route::prefix('app')->group(function () {

    // Pintu masuk khusus Login React
    Route::get('/platform/auth/login', function () {
        return view('dashboard::app');
    })->name('platform.dashboard.login');
    
    // Semua halaman React lainnya
    Route::get('/{any?}', function () {
        return view('dashboard::app');
    })->where('any', '.*');

});