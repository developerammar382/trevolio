<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Get all settings grouped by category
     */
    public function index()
    {
        $settings = Setting::all();

        // Group settings by their group
        $grouped = $settings->groupBy('group')->map(function ($items) {
            return $items->pluck('value', 'key');
        });

        // Add full URL for logo if it exists
        if (isset($grouped['general']['site_logo'])) {
            $grouped['general']['site_logo_url'] = url('storage/' . $grouped['general']['site_logo']);
        }

        return response()->json($grouped);
    }

    /**
     * Update multiple settings at once
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
            'settings.*.group' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->settings as $settingData) {
            Setting::updateOrCreate(
                ['key' => $settingData['key']],
                [
                    'value' => $settingData['value'] ?? '',
                    'group' => $settingData['group'] ?? 'general',
                ]
            );
        }

        return response()->json([
            'message' => 'Settings updated successfully'
        ]);
    }

    /**
     * Update a single setting
     */
    public function updateSingle(Request $request, $key)
    {
        $validator = Validator::make($request->all(), [
            'value' => 'required|string',
            'group' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $setting = Setting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $request->value,
                'group' => $request->group ?? 'general',
            ]
        );

        return response()->json([
            'message' => 'Setting updated successfully',
            'setting' => $setting
        ]);
    }

    /**
     * Upload logo
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|max:2048', // Max 2MB
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('settings', 'public');

            // Update or create the setting
            Setting::updateOrCreate(
                ['key' => 'site_logo'],
                [
                    'value' => $path,
                    'group' => 'general'
                ]
            );

            return response()->json([
                'message' => 'Logo uploaded successfully',
                'url' => url('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Upload footer logo
     */
    public function uploadFooterLogo(Request $request)
    {
        $request->validate([
            'footer_logo' => 'required|image|max:2048', // Max 2MB
        ]);

        if ($request->hasFile('footer_logo')) {
            $path = $request->file('footer_logo')->store('settings', 'public');

            // Update or create the setting
            Setting::updateOrCreate(
                ['key' => 'footer_logo'],
                [
                    'value' => $path,
                    'group' => 'general'
                ]
            );

            return response()->json([
                'message' => 'Footer logo uploaded successfully',
                'url' => url('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }
}
