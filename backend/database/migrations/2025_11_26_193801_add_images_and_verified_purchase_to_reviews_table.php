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
        Schema::table('reviews', function (Blueprint $table) {
            $table->json('images')->nullable()->after('comment');
            $table->boolean('is_verified_purchase')->default(false)->after('images');
            $table->integer('helpful_count')->default(0)->after('helpful_votes');
            $table->integer('not_helpful_count')->default(0)->after('helpful_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['images', 'is_verified_purchase', 'helpful_count', 'not_helpful_count']);
        });
    }
};
