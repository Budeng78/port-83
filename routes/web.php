<?php

use Illuminate\Support\Facades\Route;
use Modules\LandingPages\Http\Controllers\LandingPageController;


Route::get('/', [LandingPageController::class, 'index']);

Route::prefix('app')->group(function () {
    Route::get('/dashboard/{any?}', function () {
        return view('dashboard::index');
    })->where('any', '.*');
});