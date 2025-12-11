<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->boolean('show_gradient')->default(true)->after('bg_color');
            $table->string('gradient_type')->default('preset')->after('show_gradient'); // 'preset' or 'custom'
            $table->string('gradient_start_color')->nullable()->after('gradient_type');
            $table->string('gradient_end_color')->nullable()->after('gradient_start_color');
            $table->string('gradient_direction')->default('to-r')->after('gradient_end_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn([
                'show_gradient',
                'gradient_type',
                'gradient_start_color',
                'gradient_end_color',
                'gradient_direction'
            ]);
        });
    }
};
