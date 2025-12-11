<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();

        foreach ($categories as $category) {
            for ($i = 1; $i <= 10; $i++) {
                $name = $category->name . ' Product ' . $i;
                Product::create([
                    'category_id' => $category->id,
                    'name' => $name,
                    'slug' => Str::slug($name) . '-' . Str::random(5),
                    'description' => 'This is a description for ' . $name,
                    'price' => rand(10, 1000),
                    'sale_price' => rand(0, 1) ? rand(5, 900) : null,
                    'sku' => strtoupper(Str::random(8)),
                    'stock_quantity' => rand(0, 100),
                    'is_featured' => rand(0, 1),
                    'is_active' => true,
                    'images' => ['https://via.placeholder.com/300'],
                ]);
            }
        }
    }
}
