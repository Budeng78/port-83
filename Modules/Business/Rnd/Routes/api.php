<?php

use Illuminate\Support\Facades\Route;
use Modules\Business\Rnd\Http\Controllers\RndTobaccoAturanController;
use Modules\Business\Rnd\Http\Controllers\RndAturanTbkKirimanController;

Route::middleware('auth:sanctum')
    ->prefix('rnd')
    ->group(function () {

        Route::prefix('aturan')->group(function () {

            /*
            |--------------------------------------------------------------------------
            | Aturan Tembakau
            |--------------------------------------------------------------------------
            */

            // List semua aturan aktif
            Route::get('/', [
                RndTobaccoAturanController::class,
                'index'
            ])->name('rnd.aturan.index');

            // Simpan aturan baru + detail
            Route::post('/', [
                RndTobaccoAturanController::class,
                'store'
            ])->name('rnd.aturan.store');

            /*
            |--------------------------------------------------------------------------
            | Kiriman Aturan
            |--------------------------------------------------------------------------
            */

            // List semua kiriman berdasarkan aturan
            Route::get('/{aturanId}/kiriman', [
                RndAturanTbkKirimanController::class,
                'index'
            ])->name('rnd.aturan.kiriman.index');

            // Simpan kiriman + detail
            Route::post('/{aturanId}/kiriman', [
                RndAturanTbkKirimanController::class,
                'store'
            ])->name('rnd.aturan.kiriman.store');

            /*
            |--------------------------------------------------------------------------
            | Trash
            |--------------------------------------------------------------------------
            |
            | HARUS sebelum /{id}
            |
            */

            // List aturan yang sudah di-soft-delete
            Route::get('/trash', [
                RndTobaccoAturanController::class,
                'trash'
            ])->name('rnd.aturan.trash');

            /*
            |--------------------------------------------------------------------------
            | Detail Aturan
            |--------------------------------------------------------------------------
            */

            // Tampilkan satu aturan
            Route::get('/{id}', [
                RndTobaccoAturanController::class,
                'show'
            ])->name('rnd.aturan.show');

            // Update aturan + seluruh detail
            Route::put('/{id}', [
                RndTobaccoAturanController::class,
                'update'
            ])->name('rnd.aturan.update');

            // Soft delete
            Route::delete('/{id}', [
                RndTobaccoAturanController::class,
                'destroy'
            ])->name('rnd.aturan.destroy');

            /*
            |--------------------------------------------------------------------------
            | Restore
            |--------------------------------------------------------------------------
            */

            Route::post('/{id}/restore', [
                RndTobaccoAturanController::class,
                'restore'
            ])->name('rnd.aturan.restore');

            /*
            |--------------------------------------------------------------------------
            | Force Delete
            |--------------------------------------------------------------------------
            */

            Route::delete('/{id}/force', [
                RndTobaccoAturanController::class,
                'forceDelete'
            ])->name('rnd.aturan.forceDelete');
        });

        /*
        |--------------------------------------------------------------------------
        | Detail Kiriman
        |--------------------------------------------------------------------------
        |
        | Dipisahkan dari prefix aturan karena menggunakan kiriman ID.
        |
        */

        Route::prefix('kiriman')->group(function () {

            /*
            |--------------------------------------------------------------------------
            | Trash
            |--------------------------------------------------------------------------
            |
            | HARUS sebelum /{id}
            |
            */

            // List kiriman yang sudah di-soft-delete
            Route::get('/trash', [
                RndAturanTbkKirimanController::class,
                'trash'
            ])->name('rnd.kiriman.trash');

            /*
            |--------------------------------------------------------------------------
            | Detail
            |--------------------------------------------------------------------------
            */

            // Tampilkan satu kiriman lengkap
            Route::get('/{id}', [
                RndAturanTbkKirimanController::class,
                'show'
            ])->name('rnd.kiriman.show');

            // Update kiriman + detail
            Route::put('/{id}', [
                RndAturanTbkKirimanController::class,
                'update'
            ])->name('rnd.kiriman.update');

            /*
            |--------------------------------------------------------------------------
            | Restore
            |--------------------------------------------------------------------------
            */

            Route::post('/{id}/restore', [
                RndAturanTbkKirimanController::class,
                'restore'
            ])->name('rnd.kiriman.restore');

            /*
            |--------------------------------------------------------------------------
            | Force Delete
            |--------------------------------------------------------------------------
            */

            Route::delete('/{id}/force', [
                RndAturanTbkKirimanController::class,
                'forceDelete'
            ])->name('rnd.kiriman.forceDelete');

            /*
            |--------------------------------------------------------------------------
            | Soft Delete
            |--------------------------------------------------------------------------
            */

            Route::delete('/{id}', [
                RndAturanTbkKirimanController::class,
                'destroy'
            ])->name('rnd.kiriman.destroy');
        });
    });