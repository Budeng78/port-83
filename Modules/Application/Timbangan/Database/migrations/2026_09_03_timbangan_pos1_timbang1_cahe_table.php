<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timbangan_pos1_timbang1_cache', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('target_id');

            $table->unsignedInteger('nomor_bal');
            $table->decimal('berat_kotor', 12, 3);

            $table->timestamps();

            $table->foreign('target_id')
                ->references('id')
                ->on('timbangan_pos1_target')
                ->cascadeOnDelete();

            $table->unique([
                'target_id',
                'nomor_bal',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timbangan_pos1_timbang1_cache');
    }
};

