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
            
            // Relasi Hierarki Menu (Parent-Child)
            $table->uuid('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('menus')->onDelete('cascade');

            // Atribut Utama Menu
            $table->string('title');
            $table->string('route');
            $table->string('icon')->nullable();
            $table->string('permission_name')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);

            // Standard Timestamps & Soft Deletes
            $table->timestamps();
            $table->softDeletes();

            // Blameable Columns
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();
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