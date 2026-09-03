<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rnd_tobacco_aturan_detail', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi ke header aturan
            $table->uuid('aturan_id');

            // Data aturan
            $table->enum('type', ['krosok', 'precut']);
            $table->unsignedInteger('no');

            $table->string('gdg', 50);
            $table->string('jenis_tembakau', 50);
            $table->year('tahun');
            $table->string('s_k', 50);
            $table->string('grade', 50);
            $table->decimal('rencana', 12, 2);

            // Audit BaseModel / Blameable
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Foreign key
            $table->foreign('aturan_id')
                ->references('id')
                ->on('rnd_tobacco_aturan')
                ->cascadeOnDelete();

            // Nomor urut global dalam satu aturan
            $table->unique(['aturan_id', 'no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rnd_tobacco_aturan_detail');
    }
};