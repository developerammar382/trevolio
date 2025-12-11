<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    /**
     * Get all active banners for public display
     */
    public function index()
    {
        $banners = Banner::active()
            ->ordered()
            ->get();

        return response()->json($banners);
    }
}
