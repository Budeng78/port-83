<?php

use Illuminate\Support\Facades\Route;
use Modules\Platform\Auth\Http\Controllers\AuthController;
use Modules\Platform\Auth\Http\Controllers\UserController;


// Public routes (Login)
Route::prefix('app')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::apiResource('users', UserController::class);


});