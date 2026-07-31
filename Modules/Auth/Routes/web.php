<?php

use Illuminate\Support\Facades\Route;

Route::prefix('app')->group(function () {
    // Menangkap rute login dan sub-rutenya untuk dikelola React Router
    Route::get('/login/{any?}', function () {
        return view('auth::app');
    })->where('any', '.*')->name('login');

    // Menangkap rute register jika dipisah
    Route::get('/register/{any?}', function () {
        return view('auth::app');
    })->where('any', '.*');
});