<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'sale_price' => $this->faker->optional(0.3)->randomFloat(2, 5, 900),
            'stock_quantity' => $this->faker->numberBetween(0, 100),
            'sku' => $this->faker->unique()->ean8(),
            'is_active' => true,
            'is_featured' => $this->faker->boolean(20),
            'images' => json_encode([$this->faker->imageUrl()]),
            'category_id' => 1,
        ];
    }
}
