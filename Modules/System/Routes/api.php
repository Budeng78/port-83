<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\System\Http\Controllers\MenuController;
use Modules\System\Http\Controllers\TrashController;
use Modules\System\Http\Controllers\ModuleController;


Route::middleware(['auth:sanctum'])->prefix('core')->group(function () {
    // Menyediakan seluruh endpoint CRUD secara otomatis (index, store, show, update, destroy)
    Route::apiResource('menus', MenuController::class);

    Route::prefix('system')->group(function () {
    Route::get('/modules', [ModuleController::class, 'index']);
    Route::post('/modules/{alias}/toggle', [ModuleController::class, 'toggle']);
    });

    Route::prefix('trash')->group(function () {
        Route::get('/all', [TrashController::class, 'indexAll']);
        Route::get('/{module}/{resource}', [TrashController::class, 'index']);
        Route::post('/{module}/{resource}/{id}/restore', [TrashController::class, 'restore']);
        Route::delete('/{module}/{resource}/{id}/force-delete', [TrashController::class, 'forceDelete']);
    });
    


});
