<?php

use Illuminate\Support\Facades\Route;
use Modules\Application\Timbangan\Http\Controllers\Pos1\Pos1Timbang1Controller;
use Modules\Application\Timbangan\Http\Controllers\Pos1\TargetAturanController;
use Modules\Application\Timbangan\Http\Controllers\Pos1\TargetAturanDetailController;
use Modules\Application\Timbangan\Http\Controllers\Pos1\TargetController;

Route::middleware('auth:sanctum')->prefix('timbangan')->group(function () {

    Route::prefix('pos1')->group(function () {

        // Target
            Route::apiResource('target', TargetController::class)
                ->names('timbangan.pos1.target');

            // Aturan


        Route::get(
            'target/{target}/aturan',
            [TargetAturanController::class, 'index']
        )->name('timbangan.pos1.aturan.index');
        
        Route::delete(
            'aturan/{targetAturan}',
            [TargetAturanController::class, 'destroy']
        )->name('timbangan.pos1.aturan.destroy');

        // Detail Aturan
        Route::get(
            'aturan/{targetAturan}/detail',
            [TargetAturanDetailController::class, 'index']
        )->name('timbangan.pos1.aturan.detail.index');

        Route::post(
            'aturan/{targetAturan}/detail',
            [TargetAturanDetailController::class, 'store']
        )->name('timbangan.pos1.aturan.detail.store');

        Route::get(
            'aturan/{targetAturan}/detail/{detailId}',
            [TargetAturanDetailController::class, 'show']
        )->name('timbangan.pos1.aturan.detail.show');

        Route::put(
            'aturan/{targetAturan}/detail/{detailId}',
            [TargetAturanDetailController::class, 'update']
        )->name('timbangan.pos1.aturan.detail.update');

        Route::delete(
            'aturan/{targetAturan}/detail/{detailId}',
            [TargetAturanDetailController::class, 'destroy']
        )->name('timbangan.pos1.aturan.detail.destroy');

        // Timbangan
        Route::get('target-aktif', [Pos1Timbang1Controller::class, 'getTargetAktif']);

        // Timbangan
        Route::get('target-aktif', [Pos1Timbang1Controller::class, 'getTargetAktif']);
        Route::patch('target/{targetId}/status', [Pos1Timbang1Controller::class, 'updateStatus']);
        Route::get('live-data', [Pos1Timbang1Controller::class, 'getLiveData']);
        Route::post('stream', [Pos1Timbang1Controller::class, 'storeStream']);

        // Cache
        Route::prefix('cache')->group(function () {
            Route::delete('target/{targetId}', [Pos1Timbang1Controller::class, 'clearCacheByTarget']);
            Route::delete('{id}', [Pos1Timbang1Controller::class, 'deleteCache']);
        });

        // Commit
        Route::post('commit', [Pos1Timbang1Controller::class, 'commitFinal']);
    });

    // POS 2
    Route::prefix('pos2')->group(function () {});

    // POS 3 - POS 6
    Route::prefix('pos3')->group(function () {});
    Route::prefix('pos4')->group(function () {});
    Route::prefix('pos5')->group(function () {});
    Route::prefix('pos6')->group(function () {});
});