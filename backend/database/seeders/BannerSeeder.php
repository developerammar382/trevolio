<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Banner;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Premium Headphones',
                'subtitle' => 'Experience crystal clear sound quality',
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=600&fit=crop',
                'button_text' => 'Shop Now',
                'button_link' => '/products',
                'bg_color' => 'from-blue-600 to-purple-600',
                'order_index' => 0,
                'is_active' => true,
            ],
            [
                'title' => 'Smart Watches',
                'subtitle' => 'Stay connected in style',
                'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=600&fit=crop',
                'button_text' => 'Explore Collection',
                'button_link' => '/products',
                'bg_color' => 'from-orange-500 to-red-600',
                'order_index' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Wireless Earbuds',
                'subtitle' => 'Freedom to move, power to perform',
                'image_url' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&h=600&fit=crop',
                'button_text' => 'Discover More',
                'button_link' => '/products',
                'bg_color' => 'from-green-500 to-teal-600',
                'order_index' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }
    }
}
