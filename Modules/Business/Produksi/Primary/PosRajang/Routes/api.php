<?php
use Illuminate\Support\Facades\Route;
use Modules\Business\Produksi\Primary\PosRajang\Http\Controllers\PrimaryPos1RajangWoController;
use Modules\Business\Produksi\Primary\PosRajang\Http\Controllers\TimbangAwalController;
use Modules\Business\Produksi\Primary\PosRajang\Http\Controllers\TerimaDataTimbangMasukController;
use Modules\Business\Produksi\Primary\PosRajang\Http\Controllers\PrimaryPos1RajangWoDetailController;

Route::prefix('timbangan')->group(function () {

    // Node-RED → Laravel
    Route::post('/penerimaan', [
        TerimaDataTimbangMasukController::class,
        'store'
    ]);

    // React → Laravel
    Route::get('/penerimaan', [
        TerimaDataTimbangMasukController::class,
        'show'
    ]);

});



Route::middleware('auth:sanctum')->prefix('posrajang')->group(function () {

    Route::prefix('wo')->group(function () {

        // =========================================================
        // WO HEADER
        // =========================================================

        Route::get('/', [
            PrimaryPos1RajangWoController::class,
            'index'
        ]);

        Route::post('/', [
            PrimaryPos1RajangWoController::class,
            'store'
        ]);

        Route::get('/{id}', [
            PrimaryPos1RajangWoController::class,
            'show'
        ]);

        Route::put('/{id}', [
            PrimaryPos1RajangWoController::class,
            'update'
        ]);

        Route::patch('/{id}', [
            PrimaryPos1RajangWoController::class,
            'update'
        ]);

        Route::delete('/{id}', [
            PrimaryPos1RajangWoController::class,
            'destroy'
        ]);

        Route::post('/{id}/restore', [
            PrimaryPos1RajangWoController::class,
            'restore'
        ]);


        // =========================================================
        // WO DETAIL
        // =========================================================

        Route::apiResource(
            '/{wo_id}/detail',
            PrimaryPos1RajangWoDetailController::class
        )->except([
            'create',
            'edit',
        ]);

        Route::post('/{wo_id}/detail/{id}/restore', [
            PrimaryPos1RajangWoDetailController::class,
            'restore'
        ]);

    });




    // =============================================================
    // TIMBANG AWAL
    // =============================================================

    Route::prefix('timbangawal')->group(function () {

        Route::post('/connect-and-init', [
            TimbangAwalController::class,
            'connectAndInit'
        ]);

        Route::post('/cari-batch', [
            TimbangAwalController::class,
            'cariBatch'
        ]);

        Route::post('/karung', [
            TimbangAwalController::class,
            'storeKarung'
        ]);

        Route::delete('/karung', [
            TimbangAwalController::class,
            'deleteKarung'
        ]);

        Route::post('/update-draft', [
            TimbangAwalController::class,
            'updateDraft'
        ]);

        Route::post('/finish-session', [
            TimbangAwalController::class,
            'finishSession'
        ]);

        Route::get('/print/{id}', [
            TimbangAwalController::class,
            'print'
        ]);

        // ---- MANAGE HASIL TIMBANGAN ----

        Route::get('/hasil-timbangan', [
            TimbangAwalController::class,
            'hasilTimbangan'
        ]);

        Route::get('/hasil-timbangan/{id}', [
            TimbangAwalController::class,
            'detailHasilTimbangan'
        ]);

    });

});