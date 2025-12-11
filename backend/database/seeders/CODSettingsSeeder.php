<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CODSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'cod_enabled',
                'value' => '1',
                'group' => 'payment',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'cod_fee',
                'value' => '0',
                'group' => 'payment',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'cod_currencies',
                'value' => 'PKR,USD',
                'group' => 'payment',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            // Check if setting already exists
            $exists = DB::table('settings')->where('key', $setting['key'])->exists();

            if (!$exists) {
                DB::table('settings')->insert($setting);
            }
        }
    }
}
