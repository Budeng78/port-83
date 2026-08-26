<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\Platform\System\Http\Controllers\MenuController;
use Modules\Platform\System\Http\Controllers\TrashController;
use Modules\Platform\System\Http\Controllers\ModuleController;
use Modules\Platform\System\Http\Controllers\UserNavigationMenuController;


Route::middleware(['auth:sanctum'])->prefix('system')->group(function () {
    // Menyediakan seluruh endpoint CRUD secara otomatis (index, store, show, update, destroy)
    Route::apiResource('menus', MenuController::class);
    Route::get(
        '/user-menus',
        [UserNavigationMenuController::class, 'index']
    )->name('system.user-menus.index');

    Route::get(
            '/modules',
            [ModuleController::class, 'index']
        )->name('system.modules.index');

        Route::post(
            '/modules/{alias}/toggle',
            [ModuleController::class, 'toggle']
        )->name('system.modules.toggle');

    

    Route::prefix('trash')->group(function () {
        Route::get('/all', [TrashController::class, 'indexAll']);
        Route::get('/{module}/{resource}', [TrashController::class, 'index']);
        Route::post('/{module}/{resource}/{id}/restore', [TrashController::class, 'restore']);
        Route::delete('/{module}/{resource}/{id}/force-delete', [TrashController::class, 'forceDelete']);
    });
    



});
