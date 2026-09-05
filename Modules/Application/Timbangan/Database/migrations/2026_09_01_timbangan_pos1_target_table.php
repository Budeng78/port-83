
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timbangan_pos1_target', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->date('tanggal');
            $table->string('nomor_aturan', 100);
            $table->string('jenis_tbk', 100);
            $table->string('tahun', 20);
            $table->string('grade', 100);
            $table->string('s_k', 10);
            $table->unsignedInteger('jumlah_bal');
            $table->decimal('tara', 10, 3);
            $table->enum('status', ['pending', 'active', 'finish'])->default('pending');  
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timbangan_pos1_target');
    }
};

