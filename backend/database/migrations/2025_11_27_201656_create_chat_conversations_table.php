<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['open', 'closed', 'waiting'])->default('waiting');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('user_last_seen_at')->nullable();
            $table->timestamp('admin_last_seen_at')->nullable();
            $table->boolean('user_typing')->default(false);
            $table->boolean('admin_typing')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_conversations');
    }
};
