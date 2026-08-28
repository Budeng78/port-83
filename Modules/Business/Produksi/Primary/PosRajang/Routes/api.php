<?php

use Illuminate\Support\Facades\Route;
use Modules\Business\Produksi\Primary\PosRajang\Http\Controllers\PenerimaanTimbangAwalRajangController;
use Modules\Business\Produksi\Primary\PosRajang\Http\Controllers\PrimaryPos1RajangWoController;
use Modules\Business\Produksi\Primary\PosRajang\Http\Controllers\TimbangAwalController;

Route::middleware('auth:sanctum')->prefix('posrajang')->group(function () {

    Route::prefix('wo')->group(function () {
        Route::apiResource('/', PrimaryPos1RajangWoController::class);
        Route::post('/{id}/restore', [PrimaryPos1RajangWoController::class, 'restore']);
    });

    Route::prefix('timbang-awal')->group(function () {
        Route::post('/recovery', [PenerimaanTimbangAwalRajangController::class, 'recovery']);
        Route::post('/', [PenerimaanTimbangAwalRajangController::class, 'store']);
        Route::get('/{id}', [PenerimaanTimbangAwalRajangController::class, 'show']);
        Route::post('/{id}/tally', [PenerimaanTimbangAwalRajangController::class, 'storeTally']);
        Route::delete('/{id}/tally/{nomorTally}', [PenerimaanTimbangAwalRajangController::class, 'deleteTally']);
        Route::put('/{id}/draft', [PenerimaanTimbangAwalRajangController::class, 'updateDraft']);
        Route::post('/{id}/finish', [PenerimaanTimbangAwalRajangController::class, 'finish']);
        Route::get('/{id}/print', [PenerimaanTimbangAwalRajangController::class, 'print']);
    });

    // TETAP SATU prefix karena parent sudah /posrajang
    Route::prefix('timbangawal')->group(function () {
        Route::post('/connect-and-init', [TimbangAwalController::class, 'connectAndInit']);
        Route::post('/cari-batch', [TimbangAwalController::class, 'cariBatch']);
        Route::post('/karung', [TimbangAwalController::class, 'storeKarung']);
        Route::delete('/karung', [TimbangAwalController::class, 'deleteKarung']);
        Route::post('/update-draft', [TimbangAwalController::class, 'updateDraft']);
        Route::post('/finish-session', [TimbangAwalController::class, 'finishSession']);
        Route::get('/print/{id}', [TimbangAwalController::class, 'print']);
        // ---- MANAGE HASIL TIMBANGAN ----//
        Route::get('/hasil-timbangan', [TimbangAwalController::class,'hasilTimbangan']);
        Route::get('/hasil-timbangan/{id}', [TimbangAwalController::class,'detailHasilTimbangan']);


    });
});