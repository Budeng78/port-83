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

            /*
             * Access Control
             *
             * assignment_key:
             * Menentukan assignment yang berhak membuka menu.
             *
             * Contoh:
             * POSRAJANG
             * POSKITCHEN
             * POSGUDANGBLEND
             */
            $table->string('assignment_key')->nullable()->index();

            /*
             * permission_key:
             * Menentukan permission/fungsi yang dapat
             * diakses setelah user masuk ke area/menu.
             *
             * Contoh:
             * rajang.view
             * rajang.create
             * rajang.edit
             * rajang.approve
             * rajang.report
             */
            $table->string('permission_key')->nullable()->index();

            /*
             * Parent Menu
             */
            $table->foreignUuid('parent_id')
                ->nullable()
                ->constrained('menus')
                ->cascadeOnDelete();

            /*
             * Ordering
             */
            $table->integer('order')->default(0);

            /*
             * Status
             */
            $table->boolean('is_active')->default(true);

            /*
             * Blameable
             */
            $table->foreignUuid('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUuid('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignUuid('deleted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

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