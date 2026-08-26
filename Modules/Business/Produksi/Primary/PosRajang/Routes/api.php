<?php

use Illuminate\Support\Facades\Route;
use Modules\Business\Produksi\Primary\PosRajang\Http\Controllers\PrimaryPos1RajangTimbangAwalController;

Route::middleware(['auth:sanctum'])
    ->prefix('posrajang')
    ->group(function () {

        Route::prefix('timbang/timbang-awal')
            ->group(function () {

                /*
                |--------------------------------------------------------------------------
                | HEADER
                |--------------------------------------------------------------------------
                */

                Route::post(
                    '/',
                    [
                        PrimaryPos1RajangTimbangAwalController::class,
                        'store'
                    ]
                )->name(
                    'primary.pos1.rajang.timbang-awal.store'
                );


                /*
                |--------------------------------------------------------------------------
                | CACHE / TALLY
                |--------------------------------------------------------------------------
                */

                Route::post(
                    '/{id}/cache',
                    [
                        PrimaryPos1RajangTimbangAwalController::class,
                        'storeCache'
                    ]
                )->name(
                    'primary.pos1.rajang.timbang-awal.cache.store'
                );


                /*
                |--------------------------------------------------------------------------
                | DELETE TALLY
                |--------------------------------------------------------------------------
                |
                | Hanya menghapus tally dari CACHE.
                |
                | Setelah dihapus, nomor tally dirapatkan kembali:
                |
                | 1,2,3,4,5
                |       X
                |
                | menjadi:
                |
                | 1,2,3,4
                |
                */

                Route::delete(
                    '/{id}/cache/{nomorTally}',
                    [
                        PrimaryPos1RajangTimbangAwalController::class,
                        'deleteTally'
                    ]
                )->name(
                    'primary.pos1.rajang.timbang-awal.cache.delete'
                );


                
                /*
                |--------------------------------------------------------------------------
                | NEXT TALLY
                |--------------------------------------------------------------------------
                */

                Route::get(
                    '/{id}/next-tally',
                    [
                        PrimaryPos1RajangTimbangAwalController::class,
                        'nextTally'
                    ]
                )->name(
                    'primary.pos1.rajang.timbang-awal.next-tally'
                );


                /*
                |--------------------------------------------------------------------------
                | SELESAI TIMBANG
                |--------------------------------------------------------------------------
                */

                Route::post(
                    '/{id}/finish',
                    [
                        PrimaryPos1RajangTimbangAwalController::class,
                        'finish'
                    ]
                )->name(
                    'primary.pos1.rajang.timbang-awal.finish'
                );


                /*
                |--------------------------------------------------------------------------
                | SHOW / RECOVERY
                |--------------------------------------------------------------------------
                |
                | Harus paling bawah karena menggunakan /{id}.
                |
                */

                Route::get(
                    '/{id}',
                    [
                        PrimaryPos1RajangTimbangAwalController::class,
                        'show'
                    ]
                )->name(
                    'primary.pos1.rajang.timbang-awal.show'
                );
            });
    });