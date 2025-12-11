<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;

class AuthenticatedCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_place_order_with_stripe()
    {
        // Mock Stripe
        putenv('STRIPE_SECRET=sk_test_dummy');
        \Stripe\Stripe::setApiKey('sk_test_dummy');
        $mock = \Mockery::mock(\Stripe\HttpClient\ClientInterface::class);
        $mock->shouldReceive('request')
            ->andReturn([
                json_encode([
                    'id' => 'pi_123',
                    'object' => 'payment_intent',
                    'client_secret' => 'pi_123_secret',
                    'amount' => 12000,
                    'currency' => 'usd',
                    'status' => 'requires_payment_method',
                ]),
                200,
                []
            ]);
        \Stripe\ApiRequestor::setHttpClient($mock);

        $user = User::factory()->create();
        $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 100,
            'sale_price' => null,
            'stock_quantity' => 10,
        ]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1]
            ],
            'shipping_address' => [
                'full_name' => 'Test User',
                'address' => '123 Test St',
                'city' => 'Test City',
                'postal_code' => '12345',
                'email' => $user->email
            ],
            'billing_address' => [
                'full_name' => 'Test User',
                'address' => '123 Test St',
                'city' => 'Test City',
                'postal_code' => '12345',
                'email' => $user->email
            ],
            'payment_method' => 'stripe'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'order',
                'clientSecret'
            ]);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total' => 120, // 100 + 10 tax + 10 shipping
            'transaction_id' => 'pi_123'
        ]);
    }
}
