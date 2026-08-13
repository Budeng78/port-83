<?php

use Illuminate\Support\Facades\Route;

Route::prefix('app')->group(function () {
    
    Route::get('/login', function () {
        return view('auth::app');
    })->name('login');
   
    
    Route::get('/{any?}', function () {
        return view('dashboard::app');
    })->where('any', '.*');
});