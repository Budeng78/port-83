<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_assignments', function (Blueprint $table) {
            // UUID — mengikuti BaseModel / HasUuids
            $table->uuid('id')->primary();

            // User
            $table->uuid('user_id');

            // Unit organisasi
            $table->uuid('organization_unit_id');

            // Level organisasi
            $table->uuid('organization_level_id');

            // Assignment utama user
            $table->boolean('is_primary')
                ->default(false);

            // Masa berlaku assignment
            $table->date('starts_at')
                ->nullable();

            $table->date('ends_at')
                ->nullable();

            $table->boolean('is_active')
                ->default(true);

            // Audit
            $table->uuid('created_by')
                ->nullable();

            $table->uuid('updated_by')
                ->nullable();

            $table->uuid('deleted_by')
                ->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Index
            $table->index('user_id');
            $table->index('organization_unit_id');
            $table->index('organization_level_id');
            $table->index('is_active');

            // Relasi
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('organization_unit_id')
                ->references('id')
                ->on('organization_units')
                ->cascadeOnDelete();

            $table->foreign('organization_level_id')
                ->references('id')
                ->on('organization_levels')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_assignments');
    }
};