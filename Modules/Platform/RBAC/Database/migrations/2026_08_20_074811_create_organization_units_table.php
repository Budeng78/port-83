<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_units', function (Blueprint $table) {
            // UUID — mengikuti BaseModel / HasUuids
            $table->uuid('id')->primary();

            // Hierarki organisasi
            $table->uuid('parent_id')
                ->nullable();

            $table->string('code', 50)
                ->unique();

            $table->string('name', 150);

            $table->string('type', 50)
                ->nullable();

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

            // Index
            $table->index('parent_id');
            $table->index('type');
            $table->index('is_active');

            // Self reference
            $table->foreign('parent_id')
                ->references('id')
                ->on('organization_units')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_units');
    }
};