<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('landingpages::pages.welcome');
});