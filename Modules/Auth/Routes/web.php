<?php

use Illuminate\Support\Facades\Route;

Route::prefix('app')->group(function () {
    Route::get('/login', function () {
        return view('auth::login');
    })->name('login');
});