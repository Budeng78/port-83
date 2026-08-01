<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;
use Modules\Auth\Http\Controllers\UserController;
use Modules\Auth\Http\Controllers\RoleController;
use Modules\Auth\Http\Controllers\PermissionController;
use Modules\Auth\Http\Controllers\MatrixController;

// Public routes (Login)
Route::prefix('app')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth actions
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // User Management inside Auth module
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Role & Permission Management
    Route::apiResource('roles', RoleController::class);
    Route::get('permissions', [PermissionController::class, 'index']);
    Route::get('matrix/permissions', [MatrixController::class, 'index']);
    Route::post('matrix/permissions', [MatrixController::class, 'update']);
});