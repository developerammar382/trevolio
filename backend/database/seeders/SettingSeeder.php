<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Settings
            ['key' => 'site_name', 'value' => 'E-Store', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'Your one-stop shop for amazing products', 'group' => 'general'],
            ['key' => 'site_email', 'value' => 'contact@estore.com', 'group' => 'general'],
            ['key' => 'site_phone', 'value' => '+1 234 567 8900', 'group' => 'general'],

            // Store Settings
            ['key' => 'currency', 'value' => 'Rs.', 'group' => 'store'],
            ['key' => 'tax_rate', 'value' => '0', 'group' => 'store'],
            ['key' => 'shipping_fee', 'value' => '0', 'group' => 'store'],

            // Social Media
            ['key' => 'facebook', 'value' => '', 'group' => 'social'],
            ['key' => 'twitter', 'value' => '', 'group' => 'social'],
            ['key' => 'instagram', 'value' => '', 'group' => 'social'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
