<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_levels', function (Blueprint $table) {
            // UUID — mengikuti BaseModel / HasUuids
            $table->uuid('id')->primary();

            // Memungkinkan level bertingkat
            $table->uuid('parent_id')
                ->nullable();

            $table->string('code', 50)
                ->unique();

            $table->string('name', 100);

            $table->text('description')
                ->nullable();

            $table->unsignedInteger('sort_order')
                ->default(0);

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

            $table->index('parent_id');
            $table->index('is_active');

            $table->foreign('parent_id')
                ->references('id')
                ->on('organization_levels')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_levels');
    }
};