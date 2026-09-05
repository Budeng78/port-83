<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rnd_aturan_tbk_kiriman', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Kolom FK
            $table->uuid('aturan_id');

            $table->string('no_surat_kiriman', 100);
            $table->string('nomor_kendaraan', 50);
            $table->string('nama_sopir', 100);
            $table->string('dari', 100);

            $table->timestamps();
            $table->softDeletes();

            // Foreign Key (disamakan dengan style tabel terdahulu)
            $table->foreign('aturan_id')
                ->references('id')
                ->on('rnd_tobacco_aturan')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rnd_aturan_tbk_kiriman');
    }
};