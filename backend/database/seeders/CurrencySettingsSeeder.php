<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class CurrencySettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencySettings = [
            [
                'key' => 'currency',
                'value' => 'PKR',
                'group' => 'currency',
            ],
            [
                'key' => 'usd_to_pkr_rate',
                'value' => '280',
                'group' => 'currency',
            ],
        ];

        foreach ($currencySettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
