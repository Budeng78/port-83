<?php

use Illuminate\Support\Facades\Route;
use Modules\Application\Timbangan\Http\Controllers\Pos1\Pos1TargetController;

Route::middleware('auth:sanctum')
    ->prefix('timbangan/pos1')
    ->group(function () {
        Route::apiResource('target', Pos1TargetController::class);
    });
