<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;
use Modules\Auth\Http\Controllers\UserController;
use Modules\RBAC\Http\Controllers\RoleController;
use Modules\RBAC\Http\Controllers\PermissionController;
use Modules\RBAC\Http\Controllers\MatrixController;

// Public routes (Login)
Route::prefix('app')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth actions
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    Route::apiResource('users', UserController::class);

    // Role & Permission Management
    Route::apiResource('roles', RoleController::class);
    Route::get('permissions', [PermissionController::class, 'index']);
    Route::get('matrix/permissions', [MatrixController::class, 'index']);
    Route::post('matrix/permissions', [MatrixController::class, 'update']);
});