<?php

use Illuminate\Support\Facades\Route;
use Modules\Application\Timbangan\Http\Controllers\Pos1\Pos1Timbang1Controller;
use Modules\Application\Timbangan\Http\Controllers\Pos1\TargetAturanController;
use Modules\Application\Timbangan\Http\Controllers\Pos1\TargetAturanDetailController;
use Modules\Application\Timbangan\Http\Controllers\Pos1\TargetController;
use Modules\Application\Timbangan\Http\Controllers\Pos1\TimbanganReportController;
use Modules\Application\Timbangan\Http\Controllers\Pos1\Timbang2Controller;


Route::middleware('auth:sanctum')->prefix('timbangan')->group(function () {

    Route::prefix('pos1')->group(function () {

        // Target
          Route::get(
            'target/next-code',
            [TargetController::class, 'nextCode']
        )->name('timbangan.pos1.target.next-code');

        Route::apiResource('target', TargetController::class)->names('timbangan.pos1.target');
       

        // Aturan
        Route::get('target/{target}/aturan',[TargetAturanController::class, 'index'])->name('timbangan.pos1.aturan.index');
        Route::delete('aturan/{targetAturan}',[TargetAturanController::class, 'destroy'])->name('timbangan.pos1.aturan.destroy');

        // Detail Aturan
        Route::get('aturan/{targetAturan}/detail',[TargetAturanDetailController::class, 'index'])->name('timbangan.pos1.aturan.detail.index');
        Route::post('aturan/{targetAturan}/detail',[TargetAturanDetailController::class, 'store'])->name('timbangan.pos1.aturan.detail.store');
        Route::get('aturan/{targetAturan}/detail/{detailId}',[TargetAturanDetailController::class, 'show'])->name('timbangan.pos1.aturan.detail.show');
        Route::put('aturan/{targetAturan}/detail/{detailId}',[TargetAturanDetailController::class, 'update'])->name('timbangan.pos1.aturan.detail.update');
        Route::delete('aturan/{targetAturan}/detail/{detailId}',[TargetAturanDetailController::class, 'destroy'])->name('timbangan.pos1.aturan.detail.destroy');


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
        

        // Report
        Route::get('report',[TimbanganReportController::class, 'index'])->name('timbangan.pos1.report.index');
        Route::get('report/{targetId}',[TimbanganReportController::class, 'show'])->name('timbangan.pos1.report.show');

        // timbang2 [ selesai rajang ]
        Route::prefix('timbang2')->group(function () {

            /**
             * Target Kerja Timbang 2
             *
             * Sumber:
             * timbangan_pos1_timbang1
             */
            Route::get(
                'target',
                [Timbang2Controller::class, 'getTargetTimbang1']
            )->name(
                'timbangan.pos1.timbang2.target'
            );


            /**
             * Data Timbang 1
             */
            Route::get(
                'timbang1/{targetId}/{detailId}',
                [Timbang2Controller::class, 'getTimbang1']
            )->name(
                'timbangan.pos1.timbang2.timbang1'
            );


            /**
             * Live Data Timbang 2
             */
            Route::get(
                'live-data/{targetId}/{detailId}',
                [Timbang2Controller::class, 'getLiveData']
            )->name(
                'timbangan.pos1.timbang2.live-data'
            );


            /**
             * Simpan ke cache
             */
            Route::post(
                'stream',
                [Timbang2Controller::class, 'storeStream']
            )->name(
                'timbangan.pos1.timbang2.stream'
            );


            /**
             * Hapus satu cache
             */
            Route::delete(
                'cache/{id}',
                [Timbang2Controller::class, 'deleteCache']
            )->name(
                'timbangan.pos1.timbang2.cache.delete'
            );


            /**
             * Hapus semua cache berdasarkan target
             */
            Route::delete(
                'cache/target/{targetId}',
                [Timbang2Controller::class, 'clearCacheByTarget']
            )->name(
                'timbangan.pos1.timbang2.cache.clear'
            );


            /**
             * Commit
             */
            Route::post(
                'commit',
                [Timbang2Controller::class, 'commitFinal']
            )->name(
                'timbangan.pos1.timbang2.commit'
            );
        });


    });

    // POS 2
    Route::prefix('pos2')->group(function () {});





    // POS 3 - POS 6
    Route::prefix('pos3')->group(function () {});
    Route::prefix('pos4')->group(function () {});
    Route::prefix('pos5')->group(function () {});
    Route::prefix('pos6')->group(function () {});
});