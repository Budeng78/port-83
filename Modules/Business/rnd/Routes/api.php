<?php
use Illuminate\Support\Facades\Route;
use Modules\Business\rnd\Http\Controllers\TobaccoAturanController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('tobacco-aturan', TobaccoAturanController::class);
});