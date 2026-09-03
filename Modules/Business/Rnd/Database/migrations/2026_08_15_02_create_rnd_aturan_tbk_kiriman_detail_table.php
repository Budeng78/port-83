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

            $table->foreignUuid('aturan_id')
                ->constrained('primary_rnd_aturan_tbk')
                ->cascadeOnDelete();

            $table->string('no_surat_kiriman', 100);
            $table->string('nomor_kendaraan', 50);
            $table->string('nama_sopir', 100);
            $table->string('dari', 100);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rnd_aturan_tbk_kiriman');
    }
};