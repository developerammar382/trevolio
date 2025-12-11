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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('refund_status')->nullable()->after('payment_status'); // null, requested, approved, rejected, processed
            $table->decimal('refund_amount', 10, 2)->nullable()->after('refund_status');
            $table->text('refund_reason')->nullable()->after('refund_amount');
            $table->timestamp('refund_requested_at')->nullable()->after('refund_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['refund_status', 'refund_amount', 'refund_reason', 'refund_requested_at']);
        });
    }
};
