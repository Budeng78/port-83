<?php

namespace Modules\LandingPages\Http\Controllers;

use App\Http\Controllers\Controller;

class LandingPageController extends Controller
{
    public function index()
    {
        return view('landingpages::index');
    }
}