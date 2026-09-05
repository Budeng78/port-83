<?php

use Illuminate\Support\Facades\Route;
use Modules\Application\Timbangan\Http\Controllers\Pos1\Pos1TargetController;
use Modules\Application\Timbangan\Http\Controllers\Pos1\Pos1Timbang1Controller;

Route::middleware('auth:sanctum')
    ->prefix('timbangan')
    ->group(function () {

        // =========================================================================
        // POS 1: Penerimaan / Penimbangan Awal
        // =========================================================================
        Route::prefix('pos1')->group(function () {
            Route::apiResource('target', Pos1TargetController::class);
            Route::get('target-aktif', [Pos1Timbang1Controller::class, 'getTargetAktif']);
            Route::get('live-data', [Pos1Timbang1Controller::class, 'getLiveData']);
            Route::post('stream', [Pos1Timbang1Controller::class, 'storeStream']);
            Route::delete('cache/{id}', [Pos1Timbang1Controller::class, 'deleteCache']);
            Route::post('commit', [Pos1Timbang1Controller::class, 'commitFinal']);
        });

        // =========================================================================
        // POS 2: (Modul Tahap Berikutnya)
        // =========================================================================
        Route::prefix('pos2')->group(function () {
            // Target, Live Stream, Cache & Commit Pos 2
        });

        // =========================================================================
        // POS 3 s/d POS 6 (Pola Mengikuti Pos 1 & 2)
        // =========================================================================
        
    });