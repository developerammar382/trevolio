<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class SettingController extends Controller
{
    /**
     * Get public settings (currency configuration)
     */
    public function getPublicSettings()
    {
        $currency = Setting::get('currency', 'PKR');
        $exchangeRate = Setting::get('usd_to_pkr_rate', '280');
        $codEnabled = Setting::get('cod_enabled', '1');
        $codFee = Setting::get('cod_fee', '0');
        $codCurrencies = Setting::get('cod_currencies', 'PKR,USD');

        return response()->json([
            'currency' => $currency,
            'exchange_rate' => (float) $exchangeRate,
            'cod_enabled' => (bool) $codEnabled,
            'cod_fee' => (float) $codFee,
            'cod_currencies' => $codCurrencies,
        ]);
    }

    /**
     * Get all public settings (for SettingsContext)
     */
    public function getAllSettings()
    {
        $settings = Setting::all();

        // Flatten settings to key-value pairs
        $flattened = [];
        foreach ($settings as $setting) {
            $flattened[$setting->key] = $setting->value;
        }

        // Add full URL for site logo if it exists
        if (isset($flattened['site_logo']) && $flattened['site_logo']) {
            $flattened['site_logo_url'] = url('storage/' . $flattened['site_logo']);
        }

        // Add full URL for footer logo if it exists
        if (isset($flattened['footer_logo']) && $flattened['footer_logo']) {
            $flattened['footer_logo_url'] = url('storage/' . $flattened['footer_logo']);
        }

        return response()->json(['data' => $flattened]);
    }
}
