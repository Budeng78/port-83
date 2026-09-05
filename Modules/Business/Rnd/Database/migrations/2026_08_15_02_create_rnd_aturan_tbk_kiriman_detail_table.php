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

            // Kolom FK
            $table->uuid('kiriman_id');
            $table->uuid('aturan_detail_id');

            $table->string('type', 20);
            $table->unsignedInteger('jumlah_pack');
            $table->decimal('tara', 10, 3);

            $table->timestamps();
            $table->softDeletes();

            // Foreign Keys (disamakan dengan style tabel terdahulu)
            $table->foreign('kiriman_id')
                ->references('id')
                ->on('rnd_aturan_tbk_kiriman')
                ->cascadeOnDelete();

            $table->foreign('aturan_detail_id')
                ->references('id')
                ->on('rnd_tobacco_aturan_detail')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rnd_aturan_tbk_kiriman_detail');
    }
};