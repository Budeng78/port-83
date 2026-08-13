<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('label');
            $table->string('path')->nullable();
            $table->string('icon')->nullable();
            $table->string('permission_name')->nullable();
            
            // Relasi parent_id dijadikan foreignUuid agar konsisten
            $table->foreignUuid('parent_id')->nullable()->constrained('menus')->cascadeOnDelete();
            
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);

            // Kolom Blameable (pencatatan user)
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};