<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rnd_aturan_tbk_kiriman_detail', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('kiriman_id')
                ->constrained('rnd_aturan_tbk_kiriman')
                ->cascadeOnDelete();

            $table->foreignUuid('aturan_detail_id')
                ->constrained('primary_rnd_aturan_tbk_detail')
                ->cascadeOnDelete();

            $table->string('type', 20);
            $table->unsignedInteger('jumlah_pack');
            $table->decimal('tara', 10, 3);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rnd_aturan_tbk_kiriman_detail');
    }
};