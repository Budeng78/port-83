<?php

use Illuminate\Support\Facades\Route;
use Modules\LandingPages\Http\Controllers\LandingPageController;


Route::get('/', [LandingPageController::class, 'index']);

