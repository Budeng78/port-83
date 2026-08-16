<?php

use Illuminate\Support\Facades\Route;
use Modules\RBAC\Http\Controllers\RoleController;
use Modules\RBAC\Http\Controllers\PermissionController;
use Modules\RBAC\Http\Controllers\MatrixController;

Route::middleware('auth:sanctum')->group(function () {

    // Role Management
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('permissions', PermissionController::class);
    Route::get('matrix/permissions', [MatrixController::class, 'index']);
    Route::post('matrix/permissions', [MatrixController::class, 'update']);

});