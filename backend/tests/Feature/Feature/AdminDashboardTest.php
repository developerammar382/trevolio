<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_dashboard_stats()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_orders',
                'total_products',
                'total_users',
                'total_revenue',
                'recent_orders',
                'low_stock_products'
            ]);
    }

    public function test_admin_can_list_products()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/products');

        $response->assertStatus(200);
    }

    public function test_admin_can_list_orders()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/orders');

        $response->assertStatus(200);
    }
}
